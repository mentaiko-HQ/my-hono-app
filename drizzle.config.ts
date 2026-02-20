import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts', // 後の工程で作る設計図の場所
  out: './drizzle', // 自動生成される管理用ファイルの出力先
  dialect: 'postgresql', // 使うデータベースの種類
  dbCredentials: {
    // ここで .dev.vars (または .env) から URL を読み込みます
    url: process.env.DATABASE_URL!,
  },
});
