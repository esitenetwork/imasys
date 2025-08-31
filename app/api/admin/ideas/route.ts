import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getIdeasFromSheet } from '@/lib/googleSheets';

// GET: アイデア一覧を取得（Google Sheets IDも含む）
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not available', success: false },
        { status: 500 }
      );
    }

    const { data: ideas, error } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json(
        { error: 'Database error', success: false },
        { status: 500 }
      );
    }

    // Google SheetsからIDを取得
    let sheetsData: any[] = [];
    try {
      sheetsData = await getIdeasFromSheet();
      console.log('Google Sheets data fetched:', sheetsData.length, 'items');
      console.log('First Google Sheets item:', sheetsData[0]);
      console.log('All Google Sheets data:', sheetsData);
    } catch (sheetsError) {
      console.warn('Could not fetch Google Sheets data:', sheetsError);
    }

    // Google Sheetsのデータをslugでマッピング
    const sheetsMap = new Map();
    sheetsData.forEach((sheetItem: any) => {
      if (sheetItem.slug) {
        sheetsMap.set(sheetItem.slug, sheetItem);
        console.log('Mapped slug:', sheetItem.slug, 'to ID:', sheetItem.id);
      }
    });
    console.log('Google Sheets mapping created:', sheetsMap.size, 'items');
    console.log('Available slugs in sheets:', Array.from(sheetsMap.keys()));

    // SupabaseのデータにGoogle Sheets IDを追加
    const ideasWithSheetsId = (ideas || []).map((idea: any) => {
      const sheetsItem = sheetsMap.get(idea.slug);
      console.log('Looking for slug:', idea.slug, 'Found:', sheetsItem?.id || 'NOT FOUND');
      return {
        ...idea,
        sheets_id: sheetsItem?.id || null
      };
    });
    console.log('Ideas with Sheets ID:', ideasWithSheetsId.map((idea: any) => ({
      slug: idea.slug,
      sheets_id: idea.sheets_id,
      created_at: idea.created_at
    })));

    return NextResponse.json({
      success: true,
      ideas: ideasWithSheetsId
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// PUT: アイデアを更新
export async function PUT(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not available', success: false },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    console.log('API: Updating idea with data:', body);

    // 必須フィールドのチェック
    if (!body.slug) {
      return NextResponse.json(
        { error: 'Slug is required for update', success: false },
        { status: 400 }
      );
    }

    // Supabaseでアイデアを更新（存在しないカラムを除外）
    const updateData = {
      title: body.title,
      category: body.category || null,
      tags: body.tags || null,
      source: body.source || null,
      status: body.status || 'draft',
      notes: body.notes || null,
      mdx_content: body.mdx_content || null,
      updated_at: new Date().toISOString()
    };

    console.log('API: Updating data:', updateData);

    const { data: updateResult, error } = await supabaseAdmin
      .from('ideas')
      .update(updateData)
      .eq('slug', body.slug)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}`, success: false },
        { status: 500 }
      );
    }

    console.log('API: Update successful:', updateResult);

    return NextResponse.json({
      success: true,
      data: updateResult
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// POST: 新しいアイデアを追加
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not available', success: false },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    console.log('API: Received data:', body);

    // 必須フィールドのチェック
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required', success: false },
        { status: 400 }
      );
    }

    // スラッグの重複チェック
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('ideas')
      .select('slug')
      .eq('slug', body.slug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking slug:', checkError);
      return NextResponse.json(
        { error: 'Database error during slug check', success: false },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists', success: false },
        { status: 409 }
      );
    }

    // Supabaseにアイデアを保存（存在しないカラムを除外）
    const insertData = {
      title: body.title,
      category: body.category || null,
      tags: body.tags || null,
      source: body.source || null,
      status: body.status || 'draft',
      slug: body.slug,
      notes: body.notes || null,
      mdx_content: body.mdx_content || null
    };

    console.log('API: Inserting data:', insertData);

    const { data: insertResult, error } = await supabaseAdmin
      .from('ideas')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}`, success: false },
        { status: 500 }
      );
    }

    console.log('API: Insert successful:', insertResult);

    return NextResponse.json({
      success: true,
      data: insertResult
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}