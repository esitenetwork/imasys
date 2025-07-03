// MDXフロントマター解析ユーティリティ

export interface ParsedMDXData {
  title: string;
  description?: string;
  category: string;
  tags: string;
  price: string;
  duration: string;
  targetUsers?: string;
  source?: string;
  content: string;
}

// カテゴリのマッピング
const categoryMapping: Record<string, string> = {
  '営業・販売': '営業・販売',
  '営業支援・効率化': '営業・販売',
  '経理・会計': '経理・会計',
  '在庫・物流': '在庫・物流',
  '顧客管理': '顧客管理',
  'マーケティング': 'マーケティング',
  '人事・労務': '人事・労務',
  '製造・生産': '製造・生産',
  'カスタマーサポート': 'カスタマーサポート'
};

// 価格帯のマッピング
function normalizePriceRange(price: string): string {
  if (!price) return '';
  
  // 数字を抽出して判定
  const match = price.match(/(\d+)/);
  if (match) {
    const amount = parseInt(match[1]);
    if (amount <= 15) return '10万円〜';
    if (amount <= 40) return '30万円〜';
    if (amount <= 75) return '50万円〜';
    if (amount >= 100) return '100万円〜';
  }
  
  if (price.includes('要相談') || price.includes('相談')) {
    return '要相談';
  }
  
  return '30万円〜'; // デフォルト
}

// 構築期間のマッピング
function normalizeDuration(duration: string): string {
  if (!duration) return '';
  
  // 「構築期間 3週間」のような形式から期間を抽出
  const cleanDuration = duration.replace(/構築期間\s*/, '');
  
  if (cleanDuration.includes('1週間') || cleanDuration === '1週間') return '1週間';
  if (cleanDuration.includes('2週間') || cleanDuration === '2週間') return '2週間';
  if (cleanDuration.includes('3週間') || cleanDuration === '3週間') return '3週間';
  if (cleanDuration.includes('1ヶ月') || cleanDuration === '1ヶ月') return '1ヶ月';
  if (cleanDuration.includes('2ヶ月') || cleanDuration === '2ヶ月') return '2ヶ月';
  if (cleanDuration.includes('要相談') || cleanDuration.includes('相談')) return '要相談';
  
  return '2週間'; // デフォルト
}

export function parseMDXContent(mdxContent: string): ParsedMDXData {
  // フロントマターとコンテンツを分離
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = mdxContent.match(frontmatterRegex);
  
  if (!match) {
    // フロントマターがない場合はデフォルト値を返す
    return {
      title: '',
      category: '',
      tags: '',
      price: '',
      duration: '',
      content: mdxContent
    };
  }

  const frontmatter = match[1];
  const content = match[2];

  // フロントマターを解析
  const data: Partial<ParsedMDXData> = {};
  
  // 各フィールドを抽出
  const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
  if (titleMatch) data.title = titleMatch[1];

  const descriptionMatch = frontmatter.match(/description:\s*["']([^"']+)["']/);
  if (descriptionMatch) data.description = descriptionMatch[1];

  const categoryMatch = frontmatter.match(/category:\s*["']([^"']+)["']/);
  if (categoryMatch) {
    const rawCategory = categoryMatch[1];
    // カテゴリマッピングを適用
    data.category = categoryMapping[rawCategory] || rawCategory;
  }

  const tagsMatch = frontmatter.match(/tags:\s*\[([\s\S]*?)\]/);
  if (tagsMatch) {
    // 配列形式のタグをカンマ区切り文字列に変換
    const tagsArray = tagsMatch[1]
      .split(',')
      .map(tag => tag.trim().replace(/["']/g, ''))
      .filter(tag => tag.length > 0);
    data.tags = tagsArray.join(', ');
  }

  const priceMatch = frontmatter.match(/price:\s*["']([^"']+)["']/);
  if (priceMatch) {
    data.price = normalizePriceRange(priceMatch[1]);
  }

  const durationMatch = frontmatter.match(/duration:\s*["']([^"']+)["']/);
  if (durationMatch) {
    data.duration = normalizeDuration(durationMatch[1]);
  }

  const targetUsersMatch = frontmatter.match(/targetUsers:\s*\[([\s\S]*?)\]/);
  if (targetUsersMatch) {
    const usersArray = targetUsersMatch[1]
      .split(',')
      .map(user => user.trim().replace(/["']/g, ''))
      .filter(user => user.length > 0);
    data.targetUsers = usersArray.join(', ');
  }

  const sourceMatch = frontmatter.match(/source:\s*["']([^"']+)["']/);
  if (sourceMatch) data.source = sourceMatch[1];

  return {
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    tags: data.tags || '',
    price: data.price || '',
    duration: data.duration || '',
    targetUsers: data.targetUsers || '',
    source: data.source || '',
    content: content.trim()
  };
}

// スラッグ生成関数
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ヶー一-龠]+/g, '-')
    .replace(/^-+|-+$/g, '');
}