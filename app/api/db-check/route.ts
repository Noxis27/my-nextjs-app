import { Client } from 'pg';

// GET リクエストを受け取ったときに実行される処理
export async function GET() {

  // PostgreSQL クライアントを初期化
  // 接続情報は .env.local から取得する
  const client = new Client({
    host: process.env.DB_HOST,                    // DB ホスト名
    port: Number(process.env.DB_PORT ?? 5432),    // ポート番号
    user: process.env.DB_USER,                    // DB ユーザー名
    password: process.env.DB_PASSWORD,            // DB パスワード
    database: process.env.DB_NAME,                // 接続先 DB 名
  });

  try {
    // PostgreSQL に接続
    await client.connect();

    // テーブルが存在しない場合は作成する
    // ※ローカル確認用の簡易テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);

    // テーブルにサンプルデータを 1 件挿入
    await client.query(
      'INSERT INTO test_items(name) VALUES($1)',
      ['sample']
    );

    // 最新 5 件のデータを取得
    const res = await client.query(
      'SELECT * FROM test_items ORDER BY id DESC LIMIT 5'
    );

    // JSON 形式でレスポンスを返す
    return Response.json({ items: res.rows });
  } finally {
    // DB 接続を必ずクローズする
    // ※finally は成功・失敗に関わらず必ず実行される
    await client.end();
  }
}