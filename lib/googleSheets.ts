import { google } from 'googleapis';

// Google Sheets認証
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// アイデアの型定義
export interface IdeaRow {
  id: string;
  createdAt: string;
  title: string;
  category: string;
  tags: string;
  priceRange: string;
  duration: string;
  source: string;
  status: string;
  slug: string;
  notes: string;
}

// スプレッドシートからデータを取得
export async function getIdeasFromSheet(): Promise<IdeaRow[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A2:K', // ヘッダー行をスキップ
    });

    const rows = response.data.values || [];
    
    return rows.map((row) => ({
      id: row[0] || '',
      createdAt: row[1] || '',
      title: row[2] || '',
      category: row[3] || '',
      tags: row[4] || '',
      priceRange: row[5] || '',
      duration: row[6] || '',
      source: row[7] || '',
      status: row[8] || '',
      slug: row[9] || '',
      notes: row[10] || '',
    }));
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return [];
  }
}

// スプレッドシートに新しいアイデアを追加
export async function addIdeaToSheet(idea: Omit<IdeaRow, 'id' | 'createdAt'>): Promise<boolean> {
  try {
    // 最新のIDを取得
    const ideas = await getIdeasFromSheet();
    const lastId = ideas.length > 0 ? parseInt(ideas[ideas.length - 1].id) : 0;
    const newId = (lastId + 1).toString();
    
    // 現在の日時
    const createdAt = new Date().toLocaleDateString('ja-JP');
    
    // 新しい行のデータ
    const newRow = [
      newId,
      createdAt,
      idea.title,
      idea.category,
      idea.tags,
      idea.priceRange,
      idea.duration,
      idea.source,
      idea.status,
      idea.slug,
      idea.notes,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding idea to Google Sheets:', error);
    return false;
  }
}

// スプレッドシートの特定の行を更新
export async function updateIdeaInSheet(id: string, updates: Partial<IdeaRow>): Promise<boolean> {
  try {
    const ideas = await getIdeasFromSheet();
    const rowIndex = ideas.findIndex(idea => idea.id === id);
    
    if (rowIndex === -1) {
      console.error('Idea not found');
      return false;
    }

    // 更新する行番号（ヘッダー行を考慮して+2）
    const rowNumber = rowIndex + 2;
    
    // 現在の行データを取得
    const currentIdea = ideas[rowIndex];
    
    // 更新データをマージ
    const updatedIdea = { ...currentIdea, ...updates };
    
    // 更新する行のデータ
    const updatedRow = [
      updatedIdea.id,
      updatedIdea.createdAt,
      updatedIdea.title,
      updatedIdea.category,
      updatedIdea.tags,
      updatedIdea.priceRange,
      updatedIdea.duration,
      updatedIdea.source,
      updatedIdea.status,
      updatedIdea.slug,
      updatedIdea.notes,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `A${rowNumber}:K${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating idea in Google Sheets:', error);
    return false;
  }
}

// ステータスでフィルタリング
export async function getIdeasByStatus(status: string): Promise<IdeaRow[]> {
  const ideas = await getIdeasFromSheet();
  return ideas.filter(idea => idea.status === status);
}

// スラッグでアイデアを取得
export async function getIdeaBySlug(slug: string): Promise<IdeaRow | null> {
  const ideas = await getIdeasFromSheet();
  return ideas.find(idea => idea.slug === slug) || null;
}