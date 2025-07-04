import { NextResponse } from 'next/server';
import { getIdeasFromSheet, addIdeaToSheet, updateIdeaInSheet, deleteIdeaFromSheet } from '@/lib/googleSheets';
import { supabaseAdmin } from '@/lib/supabase';
import type { IdeaRecord } from '@/lib/supabase';
import type { IdeaRow } from '@/lib/googleSheets';

// Google Sheets同期API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { direction, action, idea } = body;
    
    // 削除処理
    if (action === 'delete' && idea) {
      return await deleteIdeaFromSheets(idea);
    }
    
    // 同期処理
    if (direction === 'sheets-to-supabase') {
      return await syncSheetsToSupabase();
    } else if (direction === 'supabase-to-sheets') {
      return await syncSupabaseToSheets();
    } else {
      return NextResponse.json(
        { error: 'Invalid direction. Use "sheets-to-supabase" or "supabase-to-sheets"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: 同期状況を確認
export async function GET() {
  try {
    // Google Sheetsからデータを取得
    const sheetsData = await getIdeasFromSheet();
    
    // Supabaseからデータを取得
    const { data: supabaseData, error } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      status: {
        sheetsCount: sheetsData.length,
        supabaseCount: supabaseData?.length || 0,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

// Google Sheetsから削除
async function deleteIdeaFromSheets(idea: any) {
  try {
    console.log('Deleting idea from Google Sheets:', idea.slug);

    // Google Sheetsから該当アイデアを削除
    const success = await deleteIdeaFromSheet(idea.slug);

    if (success) {
      return NextResponse.json({
        success: true,
        action: 'delete',
        message: `Idea "${idea.title}" deleted from Google Sheets`,
        deletedSlug: idea.slug
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete idea from Google Sheets', success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting idea from sheets:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea from Google Sheets', success: false },
      { status: 500 }
    );
  }
}

// Google Sheets → Supabase 同期
async function syncSheetsToSupabase() {
  try {
    // Google Sheetsからデータを取得
    const sheetsData = await getIdeasFromSheet();
    
    // Supabaseからデータを取得
    const { data: supabaseData, error: fetchError } = await supabaseAdmin
      .from('ideas')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    const supabaseMap = new Map();
    supabaseData?.forEach((item: IdeaRecord) => {
      // slugまたはidでマッピング
      if (item.slug) {
        supabaseMap.set(item.slug, item);
      }
    });

    let insertCount = 0;
    let updateCount = 0;
    let errors = [];

    for (const sheetItem of sheetsData) {
      if (!sheetItem.slug) continue;

      try {
        // Google Sheetsのデータ形式をSupabaseの形式に変換
        const supabaseRecord: Omit<IdeaRecord, 'id' | 'created_at' | 'updated_at'> = {
          title: sheetItem.title,
          category: sheetItem.category || null,
          tags: sheetItem.tags || null,
          price_range: sheetItem.priceRange || null,
          duration: sheetItem.duration || null,
          source: sheetItem.source || null,
          status: sheetItem.status || 'draft',
          slug: sheetItem.slug,
          notes: sheetItem.notes || null,
          mdx_content: null // MDXコンテンツは別途管理
        };

        const existingRecord = supabaseMap.get(sheetItem.slug);

        if (existingRecord) {
          // 更新
          const { error: updateError } = await supabaseAdmin
            .from('ideas')
            .update({
              ...supabaseRecord,
              updated_at: new Date().toISOString()
            })
            .eq('slug', sheetItem.slug);

          if (updateError) {
            errors.push(`Update error for ${sheetItem.slug}: ${updateError.message}`);
          } else {
            updateCount++;
          }
        } else {
          // 新規挿入
          const { error: insertError } = await supabaseAdmin
            .from('ideas')
            .insert(supabaseRecord);

          if (insertError) {
            errors.push(`Insert error for ${sheetItem.slug}: ${insertError.message}`);
          } else {
            insertCount++;
          }
        }
      } catch (itemError) {
        errors.push(`Error processing ${sheetItem.slug}: ${itemError}`);
      }
    }

    return NextResponse.json({
      success: true,
      direction: 'sheets-to-supabase',
      result: {
        inserted: insertCount,
        updated: updateCount,
        errors: errors.length > 0 ? errors : null
      }
    });
  } catch (error) {
    console.error('Error in sheets-to-supabase sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync sheets to supabase' },
      { status: 500 }
    );
  }
}

// Supabase → Google Sheets 同期
async function syncSupabaseToSheets() {
  try {
    // Supabaseからデータを取得
    const { data: supabaseData, error } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    // Google Sheetsからデータを取得
    const sheetsData = await getIdeasFromSheet();
    const sheetsMap = new Map();
    sheetsData.forEach((item: IdeaRow) => {
      if (item.slug) {
        sheetsMap.set(item.slug, item);
      }
    });

    let insertCount = 0;
    let updateCount = 0;
    let errors = [];

    for (const supabaseItem of supabaseData || []) {
      if (!supabaseItem.slug) continue;

      try {
        // Supabaseのデータ形式をGoogle Sheetsの形式に変換
        const sheetRecord: Omit<IdeaRow, 'id' | 'createdAt'> = {
          title: supabaseItem.title,
          category: supabaseItem.category || '',
          tags: supabaseItem.tags || '',
          priceRange: supabaseItem.price_range || '',
          duration: supabaseItem.duration || '',
          source: supabaseItem.source || '',
          status: supabaseItem.status || 'draft',
          slug: supabaseItem.slug,
          notes: supabaseItem.notes || ''
        };

        const existingRecord = sheetsMap.get(supabaseItem.slug);

        if (existingRecord) {
          // 更新
          const success = await updateIdeaInSheet(existingRecord.id, sheetRecord);
          if (success) {
            updateCount++;
          } else {
            errors.push(`Failed to update ${supabaseItem.slug} in sheets`);
          }
        } else {
          // 新規挿入
          const success = await addIdeaToSheet(sheetRecord);
          if (success) {
            insertCount++;
          } else {
            errors.push(`Failed to insert ${supabaseItem.slug} to sheets`);
          }
        }
      } catch (itemError) {
        errors.push(`Error processing ${supabaseItem.slug}: ${itemError}`);
      }
    }

    return NextResponse.json({
      success: true,
      direction: 'supabase-to-sheets',
      result: {
        inserted: insertCount,
        updated: updateCount,
        errors: errors.length > 0 ? errors : null
      }
    });
  } catch (error) {
    console.error('Error in supabase-to-sheets sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync supabase to sheets' },
      { status: 500 }
    );
  }
}