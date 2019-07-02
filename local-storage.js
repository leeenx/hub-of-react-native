/**
 * @author: lienxin
 * @description: 使用 AsyncStorage 模拟 localStorage
 */

import { AsyncStorage } from 'react-native'

// 参数匹配
const config = {
  // 最大存储量，默认 1000
  size: 1000,
  // 单位毫秒，默认 30 天
  expires: 30 * 24 * 60 * 60 * 1000
}
// 设置 config
export function setConfig (nextConfig) {
  Object.assign(config, nextConfig)
}
// 未初始化提示
function uninitial () {
  console.warn('error, localStorage is not initial!')
}
const storage = {
  length: 0,
  data: {},
  expires: {},
  modify: {},
  methods: {
    // 清空缓存
    clear () {
      this.data = {}
      this.expires = {}
      this.modify = {}
      this.length = 0
      AsyncStorage.clear()
    },
    getItem (key) {
      const value = this.data[key]
      const expires = this.expires[key]
      if (expires === undefined || expires <= Date.now()) {
        // 没有 expires 信息表示需要删除
        setData(key, null)
        return null
      }
      return value
    },
    removeItem (key) {
      setData(key, null)
    },
    setItem (
      key,
      value,
      expires = config.expires
    ) {
      if (typeof value !== 'string') {
        value = value.toString()
      }
      setData(key, value, `${expires + Date.now()}`)
    },
    setItems (items) {
      Object.keys(items).forEach(key => {
        this.setItem(key, items[key])
      })
    }
  },
  handleReadyFuns: [],
  ready (handleReady) {
    storage.isReady ?
      handleReady() :
      storage.handleReadyFuns.push(handleReady)
  }
}

// 未初始化
Object.keys(storage.methods).forEach(key => {
  storage[key] = uninitial
})

function isEmpty (value) {
  return (
    value === undefined ||
    value === null
  )
}

function setData (key, value, expiresValue) {
  if (key.indexOf('@') === 0 || key.indexOf('#') === 0) {
    throw `${key} is an invalid key for LocalStorage! Please don't use @*/#* as key`
  }
  const {
    data,
    expires,
    modify
  } = storage
  if (!data.hasOwnProperty(key) && !isEmpty(value)) {
    ++storage.length
    // 检查存储量
    checkLocalStorage()
  } else if (
    data.hasOwnProperty(key) &&
    isEmpty(value)
  ) { // 删除记录
    --storage.length
  } else if (isEmpty(value)) {
    // 无效赋值
    return
  }
  const expiresKey = `@${key}`
  const modifyKey = `#${key}`
  const modifyValue = `${Date.now()}`
  if (!isEmpty(value)) { // 赋值
    // 存值
    data[key] = value
    // 存有效期
    expires[key] = expiresValue
    // 存更新时间
    modify[key] = modifyValue
    AsyncStorage.multiSet([
      [key, value],
      [expiresKey, expiresValue],
      [modifyKey, modifyValue]
    ])
    console.log(value)
  } else { // 删除
    console.log('delete', key, value)
    delete data[key]
    delete expires[key]
    delete modify[key]
    AsyncStorage.multiRemove([
      key,
      expiresKey,
      modifyKey
    ])
  }
}

function checkLocalStorage () {
  const count = storage.length
  const { size } = config
  console.log(count, size)
  if (count >= size) {
    // 达到存储量
    console.warn('LocalStorage is full!')
    // 删除最久没有更新的缓存
    let item = { modify: Infinity }
    Object.keys(storage.modify).forEach(modifyKey => {
      const modify = storage.modify[modifyKey]
      if (item.modify > modify) {
        const key = modifyKey.replace('#', '')
        item.modify = modify,
        item.key = key
      }
    })
    item.key && storage.removeItem(item.key)
  }
}

AsyncStorage.getAllKeys().then(keys => 
  keys.length ? AsyncStorage.multiGet(keys) : []
).then(
  data => {
    // 数据长度
    const count = data.length
    if (count > 0) {
      Object.assign(
        storage,
        parseStorageData(data)
      )
    }
    Object.keys(storage.methods).forEach(key => {
      storage[key] = storage.methods[key]
    })
    storage.isReady = true
    storage.handleReadyFuns.forEach(handleReady => handleReady())
    storage.handleReadyFuns.length = 0
  }
)
function parseStorageData (data) {
  const storageData = {}
  const storageExpires = {}
  const storageModify = {}
  data.forEach(([key, value]) => {
    if (key.indexOf('@') === 0) {
      storageExpires[key.replace('@', '')] = value
    } else if (key.indexOf('#') === 0) {
      storageModify[key.replace('#', '')] = value
    } else {
      storageData[key] = value
    }
  })
  return {
    data: storageData,
    expires: storageExpires,
    modify: storageModify,
    length: data.length / 3 >> 0
  }
}

export default storage
