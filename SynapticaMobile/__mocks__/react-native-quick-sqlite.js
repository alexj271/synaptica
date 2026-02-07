/**
 * Jest mock for react-native-quick-sqlite.
 * Simulates in-memory SQLite with a simple Map-based store.
 */

const tables = new Map()

function getOrCreateTable(name) {
  if (!tables.has(name)) {
    tables.set(name, [])
  }
  return tables.get(name)
}

function makeRows(arr) {
  return {
    _array: arr,
    length: arr.length,
    item: (idx) => arr[idx],
  }
}

const mockConnection = {
  execute: jest.fn((query, params) => {
    const q = query.trim().toUpperCase()

    if (q.startsWith('CREATE TABLE') || q.startsWith('CREATE INDEX')) {
      return {rowsAffected: 0}
    }

    if (q.startsWith('INSERT')) {
      const rows = getOrCreateTable('messages')
      if (params && params.length >= 4) {
        const exists = rows.find(r => r.id === params[0])
        if (!exists) {
          rows.push({
            id: params[0],
            role: params[1],
            text: params[2],
            timestamp: params[3],
          })
        }
      }
      return {rowsAffected: 1}
    }

    if (q.includes('COUNT(*)')) {
      const rows = getOrCreateTable('messages')
      return {
        rowsAffected: 0,
        rows: makeRows([{cnt: rows.length}]),
      }
    }

    if (q.startsWith('SELECT')) {
      const rows = getOrCreateTable('messages')
      let filtered = [...rows]

      // Handle WHERE timestamp < ?
      if (q.includes('WHERE') && q.includes('TIMESTAMP <') && params?.[0]) {
        filtered = filtered.filter(r => r.timestamp < params[0])
      }

      // ORDER BY timestamp DESC
      filtered.sort((a, b) => b.timestamp - a.timestamp)

      // LIMIT
      const limitMatch = query.match(/LIMIT\s+\?/i)
      if (limitMatch) {
        const limitIdx = q.includes('WHERE') ? 1 : 0
        const limit = params?.[limitIdx] ?? 30
        filtered = filtered.slice(0, limit)
      }

      return {
        rowsAffected: 0,
        rows: makeRows(filtered),
      }
    }

    return {rowsAffected: 0, rows: makeRows([])}
  }),

  executeBatch: jest.fn((commands) => {
    for (const cmd of commands) {
      mockConnection.execute(cmd[0], cmd[1])
    }
    return {rowsAffected: commands.length}
  }),

  close: jest.fn(),
  delete: jest.fn(),
  attach: jest.fn(),
  detach: jest.fn(),
  transaction: jest.fn(),
  executeAsync: jest.fn(),
  executeBatchAsync: jest.fn(),
  loadFile: jest.fn(),
  loadFileAsync: jest.fn(),
}

const open = jest.fn(() => mockConnection)

const QuickSQLite = {
  open: jest.fn(),
  close: jest.fn(),
  delete: jest.fn(),
  execute: jest.fn(),
  executeAsync: jest.fn(),
  executeBatch: jest.fn(),
  executeBatchAsync: jest.fn(),
  transaction: jest.fn(),
  attach: jest.fn(),
  detach: jest.fn(),
  loadFile: jest.fn(),
  loadFileAsync: jest.fn(),
}

// Expose for test cleanup
function __resetMockDb() {
  tables.clear()
  mockConnection.execute.mockClear()
  mockConnection.executeBatch.mockClear()
}

module.exports = {
  open,
  QuickSQLite,
  __resetMockDb,
  __mockConnection: mockConnection,
  __tables: tables,
}
