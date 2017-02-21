var _ = require('underscore-contrib')
var config = require('../config')
var debug = require('debug')('api:couchdb')
var cradle = require('cradle')
var uuid = require('uuid')

/**
 * @typedef QueryOptions
 * @type {object}
 * @property {number} limit - the number of records to return
 * @property {number} skip - an offset, the number of records to skip
 * @property {object} sort - an object specifying properties to sort by. `{"title": 1}` will sort the results by the `title` property in ascending order. To reverse the sort, use `-1`: `{"title": -1}`
 * @property {object} fields - an object specifying which properties to return. `{"title": 1}` will return results with all properties removed except for `_id` and `title`
 */

/**
 * CouchDB Data Adapter for DADI API
 * @constructor
 */
var DataStore = function (options) {
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
 * Modifies the collection/database name for CouchDB, replacing camelCase strings with hyphens
 * @param {string} collection - the collection name to modify
 * @example
 * getCollectionName('tokenStore') // returns 'token-store'
 * @returns {string} the collection name with hyphens
 */
DataStore.prototype.getCollectionName = function (collection) {
  return _.toDash(collection)
}

/**
 * Replaces special characters at the beginning of each document property
 * to ensure insertion into CouchDB is successful. CouchDB doesn't allow underscores
 * at the beginning of property names, so this replaces them with $
 * @param {object} doc - a document to translate
 * @param {boolean} reverse - indicates which direction the translation should be.
 * If false or undefined _ is replaced with $. If true, $ is replaced with _. Should be false
 * when inserting into the database and true when sending results back.
 * @returns {object} the document with translated property names
 */
DataStore.prototype.translate = function (doc, reverse) {
  var translated = {}

  var charToReplace = reverse ? '$' : '_'
  var replacement = reverse ? '_' : '$'

  Object.keys(doc).forEach((key) => {
    if (key[0] === charToReplace && key !== '_id') {
      var newKey = `${replacement}${key.substring(1)}`
      translated[newKey] = doc[key]
    } else {
      translated[key] = doc[key]
    }
  })

  return translated
}

/**
 * @param {Object} query - the query to perform
 * @param {QueryOptions} options - a set of query options, such as offset, limit, sort, fields
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

  if (options.fields) delete options.fields

  query = Object.assign(query, options)

  return query
}

/**
 * Determines the list of properties to select from each document before returning. If an array is specified
 * it is returned. If an object is specified an array is created containing all the keys that have a value equal to 1.
 * The `_id` property is added if not already specified.
 *
 * @param {Array|Object} fields - an array of field names or an object such as `{"title": 1}`
 * @returns {Array} an array of property names to be selected from each document
 */
DataStore.prototype.getFields = function (fields) {
  if (_.isEmpty(fields)) {
    return null
  }

  var preparedFields

  if (!Array.isArray(fields)) {
    preparedFields = Object.keys(fields).filter((field) => { return fields[field] === 1 })
  } else {
    preparedFields = fields
  }

  if (!preparedFields['_id']) preparedFields.push('_id')

  return preparedFields
}

/**
 * Query the database
 *
 * @param {Object} query - the query to perform
 * @param {String} collection - the name of the collection to query
 * @param {QueryOptions} options - a set of query options, such as offset, limit, sort, fields
 * @returns {Promise.<Array, Error>} A promise that returns an Array of results,
 *     or an Error if the operation fails
 */
DataStore.prototype.find = function (query, collection, options) {
  options = options || {}
  var fields = this.getFields(options.fields)

  query = this.prepareQuery(query, options)

  debug('find in %s %o %o', collection, query, options)

  return new Promise((resolve, reject) => {
    this.getDatabase(collection).then((db) => {
      db.find(query, (err, res) => {
        if (err) return reject(err)

        var results = res.docs

        if (fields) {
          results = _.chain(results)
          .map((result) => { return _.pick(result, fields) })
          .value()
        }

        return resolve(results)
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

  for (var d = 0; d < data.length; d++) {
    // translate property names
    data[d] = this.translate(data[d])

    // add _id manually
    data[d]._id = data[d]._id || uuid.v4()
  }

  return new Promise((resolve, reject) => {
    this.getDatabase(collection).then((db) => {
      db.save(data, (err, res) => {
        if (err) return reject(err)

        var results = JSON.parse(res.toString())

        // for each result add in the data that was sent,
        // because CouchDB only gives us the id and revision
        for (var i = 0; i < results.length; i++) {
          results[i] = Object.assign(results[i], data[i])
          results[i] = this.translate(results[i], true)
          delete results[i].ok
        }

        return resolve(results)
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
DataStore.prototype.update = function (query, collection, update, options) {
  debug('update %s %o', collection, query)

  return new Promise((resolve, reject) => {
    this.find(query, collection).then((results) => {
      // no matching documents
      if (results.length === 0) {
        return resolve([])
      }

      this.doUpdate(results, collection, update).then((results) => {
        return resolve(results)
      })
    }).catch((err) => {
      console.log(err)
    })
  })
}

/**
 *
 */
DataStore.prototype.doUpdate = function (data, collection, update) {
  return new Promise((resolve, reject) => {
    this.getDatabase(collection).then((db) => {
      var results = []
      var idx = 0

      _.each(data, (document) => {
        var newDocument = Object.assign({}, document, update)

        db.put(document._id, newDocument, (err, res) => {
          if (err) {
            return reject(err)
          }

          var result = JSON.parse(res.toString())
          newDocument._rev = result.rev

          results.push(newDocument)

          if (++idx === data.length) {
            return resolve(results)
          }
        })
      })
    })
  })
}

/**
 *
 */
DataStore.prototype.delete = function (query, collection) {
  debug('delete from %s', collection)

  return new Promise((resolve, reject) => {
    this.find(query, collection).then((results) => {
      // no matching documents
      if (results.length === 0) {
        return resolve({ deletedCount: 0 })
      }

      var count = results.length
      var idx = 0

      this.getDatabase(collection).then((db) => {
        _.each(results, (document) => {
          db.remove(document._id, document._rev, (err, res) => {
            if (err) {
              return reject(err)
            }

            if (++idx === results.length) {
              return resolve({ deletedCount: count })
            }
          })
        })
      })
    })
  })
}

module.exports = DataStore
