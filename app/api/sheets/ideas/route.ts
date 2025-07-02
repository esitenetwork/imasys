import { NextResponse } from 'next/server';
import { getIdeasFromSheet, addIdeaToSheet, updateIdeaInSheet } from '@/lib/googleSheets';

// GET: スプレッドシートからアイデア一覧を取得
export async function GET() {
  try {
    const ideas = await getIdeasFromSheet();
    return NextResponse.json({ ideas, success: true });
  } catch (error) {
    console.error('Error in GET /api/sheets/ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas', success: false },
      { status: 500 }
    );
  }
}

// POST: 新しいアイデアを追加
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 必須フィールドのチェック
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required', success: false },
        { status: 400 }
      );
    }

    const success = await addIdeaToSheet({
      title: body.title,
      category: body.category || '',
      tags: body.tags || '',
      priceRange: body.priceRange || '',
      duration: body.duration || '',
      source: body.source || '',
      status: body.status || 'draft',
      slug: body.slug,
      notes: body.notes || '',
    });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to add idea', success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/sheets/ideas:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// PUT: アイデアを更新
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required', success: false },
        { status: 400 }
      );
    }

    const success = await updateIdeaInSheet(body.id, body);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to update idea', success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/sheets/ideas:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}