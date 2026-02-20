import { Hono } from 'hono';
import { getDb } from './db';
import { users } from './db/schema';

// Cloudflare Workers で環境変数を受け取るための型定義
type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. ユーザー一覧を取得する (GET)
app.get('/users', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

// 2. ユーザーを追加する (POST)
// ブラウザからは難しいので、まずはテスト用にGETで作成してみます
app.get('/add-user', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const newUser = await db
    .insert(users)
    .values({
      name: '田中 太郎',
      email: `tanaka-${Date.now()}@example.com`,
    })
    .returning();

  return c.json({
    message: 'ユーザーを追加しました！',
    user: newUser,
  });
});

export default app;
