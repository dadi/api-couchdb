var _ = require('underscore-contrib')
var config = require('../config')
var debug = require('debug')('api:couchdb')
var cradle = require('cradle')

/**
 *
 */
var DataStore = function (options) {
  debug('Initialising %o', options)

  this.config = options || config.get()

  cradle.setup({
    host: this.config.server.host,
    cache: this.config.options.cache,
    raw: this.config.options.raw,
    forceSave: this.config.options.forceSave,
    request: this.config.options.request
  })

  this.c = new cradle.Connection()
}

/**
 *
 */
DataStore.prototype.connect = function (options) {
  debug('connect %o', options)

  return new Promise((resolve, reject) => {
    var db = this.c.database(this.getCollectionName(options.collection))

    db.exists((err, exists) => {
      if (err) {
        return reject(err)
      } else if (!exists) {
        db.create((err) => {
          if (err) {
            return reject(err)
          } else {
            this.readyState = 1
            return resolve()
          }
        })
      } else {
        this.readyState = 1
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
    return resolve(this.c.database(this.getCollectionName(collection)))
  })
}

/**
 * Modifies the collection/database name for CouchDB, replacing
 * replacing camelCase and underscores with hyphens
 */
DataStore.prototype.getCollectionName = function (collection) {
  return _.toDash(collection)
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
 * Insert documents into the database
 *
 * @param {Object|Array} data - a single document or an Array of documents to insert
 * @param {String} collection - the name of the collection to insert into
 * @returns {Array} an Array containing the inserted documents
 */
DataStore.prototype.insert = function (data, collection) {
  debug('insert into %s %o', collection, data)

  // make an Array of documents if an Object has been provided
  if (!Array.isArray(data)) {
    data = [data]
  }

  return new Promise((resolve, reject) => {
    this.getDatabase(collection).then((db) => {
      db.save(data, (err, res) => {
        if (err) return reject(err)

        res = JSON.parse(res.toString())

        // for each result add in the data that as sent,
        // because CouchDB only gives us the id and revision
        for (var i = 0; i < res.length; i++) {
          res[i] = Object.assign(res[i], data[i])
          delete res[i].ok
        }

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
  debug('delete from %s', collection)

  return new Promise((resolve, reject) => {
    var results = []
    return resolve(results)
  })
}

module.exports = DataStore
