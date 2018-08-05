const keval = require('keval')
const gh = require('gh-got')

const calm = (fn, delay) => {
  let previous, latestArgs
  const clear = (reslove, reject) => {
    try { reslove(fn(...latestArgs)) }
    catch (err) { reject(err) }
    previous = undefined
  }
  const handler = (reslove, reject) => setTimeout(clear, delay, reslove, reject)
  return (...args) => {
    latestArgs = args
    return previous || (previous = new Promise(handler))
  }
}

const gistDB = ({ gistId, filename = 'db.json', token, saveDelay = 5000 }) => {
  if (typeof gistId !== 'string') {
    throw Error('a valid gistId must be provided')
  }
  if (typeof token !== 'string') {
    throw Error('a valid github API token must be provided')
  }
  if (saveDelay < 720) {
    throw Error('saveDelay must be higher or equal to 720 for gist API rates')
  }
  return keval({
    init: async () => (await gh(`gists/${gistId}`, { token }))
      .body.files[filename],
    onChange: calm(store => gh.path(`gists/${gistId}`, {
      token,
      body: {
        // description: 'gistdb update',
        files: { [filename]: { filename, content: JSON.stringify(store) } }
      })
    }), saveDelay)
  })
}
