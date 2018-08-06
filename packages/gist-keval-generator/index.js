'use strict'

const got = require('got')

module.exports.generateCredentials = async ({ login, password, note }) => {
  const Authorization = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`
  const [ { body: { token } }, { body: { id } } ] = await Promise.all([
    got.post('https://api.github.com/authorizations', {
      json: true,
      headers: { Authorization },
      body: { scopes: [ 'gist' ], note }
    }),
    got.post('https://api.github.com/gists', {
      json: true,
      headers: { Authorization },
      body: {
        files: {
          'readme.md': {
            content: '# Gist Keval Store\ndata store for [keval](https://github.com/kigiri/keval)'
          }
        }
      }
    })
  ])

  return { token, gistId: id }
}
