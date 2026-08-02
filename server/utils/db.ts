import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

let db: DatabaseSync | null = null

export function dataDir(): string {
  return useRuntimeConfig().dataDir || '.data'
}

export function useDb(): DatabaseSync {
  if (db) return db

  const dir = dataDir()
  mkdirSync(dir, { recursive: true })
  db = new DatabaseSync(join(dir, 'lumalog.db'))

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      pinned INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts(status, pinned DESC, date DESC);
  `)

  seedIfEmpty(db)
  return db
}

function seedIfEmpty(db: DatabaseSync) {
  const row = db.prepare('SELECT COUNT(*) AS n FROM posts').get() as { n: number }
  if (row.n > 0) return

  const now = new Date().toISOString()
  const insertPost = db.prepare(
    `INSERT INTO posts (slug, title, excerpt, content, date, pinned, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
  )
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)')
  const getTag = db.prepare('SELECT id FROM tags WHERE name = ?')
  const link = db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)')

  for (const p of SEED_POSTS) {
    const { lastInsertRowid } = insertPost.run(
      p.slug, p.title, p.excerpt, p.content.trim(), p.date, p.pinned ? 1 : 0, now, now,
    )
    for (const name of p.tags) {
      insertTag.run(name)
      const tag = getTag.get(name) as { id: number }
      link.run(lastInsertRowid, tag.id)
    }
  }
}
