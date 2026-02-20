import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// users という名前のテーブルを定義
export const users = pgTable('users', {
  id: serial('id').primaryKey(), // 自動で増えるID
  name: text('name').notNull(), // 名前（必須）
  email: text('email').notNull().unique(), // メール（必須・重複不可）
  createdAt: timestamp('created_at').defaultNow(), // 作成日時
});
