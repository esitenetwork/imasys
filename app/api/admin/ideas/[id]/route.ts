import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: アイデア一覧を取得
export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      ideas: ideas || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// DELETE: アイデアを削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    console.log('API: Deleting idea with id:', id);

    // IDの妥当性チェック
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid idea ID', success: false },
        { status: 400 }
      );
    }

    // 削除前にアイデア情報を取得（Google Sheets同期用）
    const { data: ideaToDelete, error: fetchError } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching idea for deletion:', fetchError);
      return NextResponse.json(
        { error: 'Idea not found', success: false },
        { status: 404 }
      );
    }

    // Supabaseからアイデアを削除
    const { error: deleteError } = await supabaseAdmin
      .from('ideas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: `Database error: ${deleteError.message}`, success: false },
        { status: 500 }
      );
    }

    console.log('API: Idea deleted successfully:', ideaToDelete.title);

    // Google Sheets同期（削除処理）
    try {
      const syncResponse = await fetch(`${request.url.split('/api')[0]}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          idea: ideaToDelete
        })
      });

      if (!syncResponse.ok) {
        console.warn('Google Sheets sync failed after deletion');
      } else {
        console.log('Google Sheets sync completed after deletion');
      }
    } catch (syncError) {
      console.warn('Google Sheets sync error after deletion:', syncError);
      // 同期エラーでも削除は成功として扱う
    }

    return NextResponse.json({
      success: true,
      message: 'Idea deleted successfully',
      deletedIdea: {
        id: ideaToDelete.id,
        title: ideaToDelete.title,
        slug: ideaToDelete.slug
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}