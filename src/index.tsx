import { Hono } from 'hono';
import { getDb } from './db';
import { users } from './db/schema';

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// --- 既存の機能 (JSONを返すAPI) ---

app.get('/', (c) => {
  return c.text('Hello Hono! 復活しました！');
});

app.get('/users', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

app.get('/add-user', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const newUser = await db
    .insert(users)
    .values({
      name: '田中 太郎',
      email: `tanaka-${Date.now()}@example.com`,
    })
    .returning();

  // 登録後、自動的にユーザー一覧画面（HTML）に戻すように少し改造
  return c.redirect('/users-page');
});

// --- 新機能 (HTMLを表示する画面) ---

app.get('/users-page', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const allUsers = await db.select().from(users);

  return c.html(
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>ユーザー管理画面</title>
        <style>{`
          body { font-family: sans-serif; margin: 40px; background: #f0f2f5; }
          .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h1 { color: #333; border-bottom: 2px solid #00b4d8; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
          th { background: #fafafa; }
          .btn { display: inline-block; background: #00b4d8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .btn:hover { background: #0077b6; }
        `}</style>
      </head>
      <body>
        <div class="container">
          <h1>👥 登録ユーザー一覧</h1>
          {/* 入力フォームの追加 */}
          <form action="/add-user-form" method="POST" style="margin-bottom: 20px; padding: 15px; background: #e9ecef; border-radius: 5px;">
            <input type="text" name="name" placeholder="名前" required style="padding: 8px; margin-right: 10px;" />
            <input type="email" name="email" placeholder="メール" required style="padding: 8px; margin-right: 10px;" />
            <button type="submit" style="padding: 8px 15px; background: #00b4d8; color: white; border: none; border-radius: 3px; cursor: pointer;">登録</button>
          </form>
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>メール</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="/add-user" class="btn">＋ テストユーザーを追加</a>
        </div>
      </body>
    </html>
  );
});
// フォームからのPOSTを受け取ってDBに保存する処理
app.post('/add-user-form', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.parseBody(); // フォームの中身を解析
  
  await db.insert(users).values({
    name: String(body.name),
    email: String(body.email),
  });

  return c.redirect('/users-page'); // 登録が終わったら一覧に戻る
});
export default app;