// 离线缓存工具函数
const DB_NAME = 'betterandbetter-db'
const STORE_NAME = 'reminders'
const VERSION = 1

export interface CachedReminder {
  id: string
  data: any
  timestamp: number
}

let db: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function cacheReminders(reminders: any[]): Promise<void> {
  try {
    const database = await initDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    // 清除旧数据
    await store.clear()

    // 保存新数据
    const promises = reminders.map((reminder) =>
      store.put({
        id: reminder.id,
        data: reminder,
        timestamp: Date.now(),
      })
    )

    await Promise.all(promises)
  } catch (error) {
    console.error('缓存失败:', error)
  }
}

export async function getCachedReminders(): Promise<any[]> {
  try {
    const database = await initDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cached = request.result as CachedReminder[]
        resolve(cached.map((item) => item.data))
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('读取缓存失败:', error)
    return []
  }
}

export async function clearCache(): Promise<void> {
  try {
    const database = await initDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    await store.clear()
  } catch (error) {
    console.error('清除缓存失败:', error)
  }
}
