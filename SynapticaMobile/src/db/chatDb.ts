import {open, QuickSQLiteConnection} from 'react-native-quick-sqlite'

const DB_NAME = 'synaptica_chat.db'
const PAGE_SIZE = 30

let db: QuickSQLiteConnection | null = null

/**
 * Открыть и инициализировать БД.
 * Безопасно вызывать многократно — idempotent.
 */
export function openChatDb(): QuickSQLiteConnection {
  if (db) return db

  db = open({name: DB_NAME})

  db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id        TEXT PRIMARY KEY,
      role      TEXT    NOT NULL CHECK(role IN ('user','assistant','system')),
      text      TEXT    NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `)

  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_messages_ts
    ON messages (timestamp DESC);
  `)

  console.log('✅ [ChatDB] Database opened & schema ready')
  return db
}

/**
 * Вставить одно сообщение (INSERT OR IGNORE — дубли не падают).
 */
export function insertMessage(msg: {
  id: string
  role: string
  text: string
  timestamp: number
}): void {
  const conn = openChatDb()
  conn.execute(
    'INSERT OR IGNORE INTO messages (id, role, text, timestamp) VALUES (?, ?, ?, ?)',
    [msg.id, msg.role, msg.text, msg.timestamp],
  )
}

/**
 * Вставить пачку сообщений в одной транзакции.
 */
export function insertMessages(
  msgs: Array<{id: string; role: string; text: string; timestamp: number}>,
): void {
  if (msgs.length === 0) return

  const conn = openChatDb()
  conn.executeBatch(
    msgs.map(m => [
      'INSERT OR IGNORE INTO messages (id, role, text, timestamp) VALUES (?, ?, ?, ?)',
      [m.id, m.role, m.text, m.timestamp],
    ]),
  )
}

/**
 * Последние N сообщений (первая страница).
 * Возвращает в хронологическом порядке (oldest → newest).
 */
export function loadRecentMessages(limit: number = PAGE_SIZE): Array<{
  id: string
  role: string
  text: string
  timestamp: number
}> {
  const conn = openChatDb()
  const result = conn.execute(
    `SELECT id, role, text, timestamp
     FROM messages
     ORDER BY timestamp DESC
     LIMIT ?`,
    [limit],
  )

  const rows = result.rows?._array ?? []
  return rows.reverse() // oldest first
}

/**
 * Подгрузить более старые сообщения (before timestamp).
 * Возвращает в хронологическом порядке (oldest → newest).
 */
export function loadOlderMessages(
  beforeTimestamp: number,
  limit: number = PAGE_SIZE,
): Array<{
  id: string
  role: string
  text: string
  timestamp: number
}> {
  const conn = openChatDb()
  const result = conn.execute(
    `SELECT id, role, text, timestamp
     FROM messages
     WHERE timestamp < ?
     ORDER BY timestamp DESC
     LIMIT ?`,
    [beforeTimestamp, limit],
  )

  const rows = result.rows?._array ?? []
  return rows.reverse()
}

/**
 * Общее число сообщений в БД.
 */
export function countMessages(): number {
  const conn = openChatDb()
  const result = conn.execute('SELECT COUNT(*) as cnt FROM messages')
  return result.rows?._array?.[0]?.cnt ?? 0
}

/**
 * Закрыть БД (для cleanup / тестов).
 */
export function closeChatDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

export {PAGE_SIZE}
