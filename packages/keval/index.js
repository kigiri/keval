'use strict'

const isNumber = val => typeof val === 'number'
const isUndefined = val => typeof val === 'undefined'
const isExpired = expire => isNumber(expire) && expire <= Date.now()
const noOp = () => {} 
module.exports = opts => {
  const {
    expiredCheckDelay = 24 * 3600 * 1000,
    init = noOp,
    onChange = noOp
  } = opts
  const store = {}
  let cache = store.cache = {}
  let expires = store.expires = {}
  let lastExpire = store.lastExpire = Date.now()
  let lastSave = lastExpire
  const loading = opts.init()
    .then(ret => ret && Object.assign(store, ret))

  const requestSave = calm(, this.opts.saveDelay)

  const get = key => {
    const value = cache[key]
    if (typeof value === 'undefined') return
    if (isExpired(expires[key])) return (remove(key), undefined)
    return value
  }
  const isValid = key => !isUndefined(cache[key]) && !isExpired(expires[key])
  const keys = () => Object.keys(cache).filter(isValid)
  const set = (key, value, ttl) => {
    cache[key] = value
    ttl && isNumber(ttl) && (expires[key] = Date.now() + ttl)
    save()
  }

  const remove = key => {
    cache[key] = undefined
    save()
    return true
  }

  const clear = () => {
    store.cache = cache = {}
    store.expire = expires = {}
    store.lastExpire = lastExpire = Date.now()
  }

  const save = () => {
    const now = Date.now()
    if (now - lastExpire > opts.expiredCheckDelay) {
      for (const key of Object.keys(expires)) {
        if (isNumber(expires[key]) && expires[key] <= now) {
          cache[key] = undefined
          expires[key] = undefined
        }
      }
      store.lastExpire = lastExpire = now
    }
    return onChange()
  }

  return {
    loading,
    get,
    set,
    keys,
    delete: remove,
    remove,
    save,
    clear,
  }
}
