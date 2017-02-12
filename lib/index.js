var debug = require('debug')('api:couchdb')
var path = require('path')
var cradle = require('cradle')

/**
 *
 */
var DataStore = function (config) {
  debug('Initialising %o', config)

  cradle.setup({
    host: config.server.host,
    cache: config.options.cache,
    raw: config.options.raw,
    forceSave: config.options.forceSave,
    request: config.options.request
  })

  this.c = new(cradle.Connection)
}

/**
 *
 */
DataStore.prototype.connect = function (options) {
  debug('connect %o', options)

  return new Promise((resolve, reject) => {
    var db = this.c.database(options.collection)

    db.exists((err, exists) => {
      if (err) {
        return reject(err)
      } else if (!exists) {
        db.create((err) => {
          if (err) {
            return reject(err)
          } else {
            return resolve()
          }
        })
      } else {
        return resolve()
      }
    })
  })
}

/**
 *
 */
DataStore.prototype.getDatabase = function (collection) {
  return new Promise((resolve, reject) => {
    return resolve(this.c.database(collection))
  })
}

/**
 *
 */
DataStore.prototype.prepareQuery = function (query, options) {
  options = options || {}

  // sanitise regex queries
  Object.keys(query).forEach((key) => {
    if (Object.prototype.toString.call(query[key]) === '[object RegExp]') {
      query[key] = { '$regex': new RegExp(query[key]).source }
    }
  })

  // wrap query with "selector" syntax for CouchDB
  query = {
    selector: query
  }

  if (options.sort) delete options.sort
  if (options.fields) delete options.fields
  if (options.page) delete options.page

  query = Object.assign(query, options)

  return query
}

/**
 *
 */
DataStore.prototype.find = function (query, collection, options) {
  query = this.prepareQuery(query, options)

  debug('find in %s %o %o', collection, query, options)

  return new Promise((resolve, reject) => {
    this.getDatabase(collection).then((db) => {
      db.find(query, (err, res) => {
        if (err) return reject(err)

        return resolve(res.docs)
      })
    }).catch((err) => {
      return reject(err)
    })
  })
}

/**
 *
 */
DataStore.prototype.insert = function (data, collection) {
  debug('insert into %s %o', collection, data)

  return new Promise((resolve, reject) => {
    this.getDatabase(collection).then((db) => {
      db.save(data, (err, res) => {
        return resolve(res)
      })
    }).catch((err) => {
      debug('error %s', JSON.stringify(err))
      return reject(err)
    })
  })
}

/**
 *
 */
DataStore.prototype.update = function (query, collection, options) {
  debug('update %s %o', collection, query)

  return new Promise((resolve, reject) => {
     var results = []
     return resolve(results)
  })
}

/**
 *
 */
DataStore.prototype.delete = function (query, collection) {
  debug('delete from %s', collectiony)

  return new Promise((resolve, reject) => {
     var results = []
     return resolve(results)
  })
}

module.exports = DataStore
