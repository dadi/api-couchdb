var EventEmitter = require('events').EventEmitter
var CouchDBAdapter = require('../../lib')
var querystring = require('querystring')
var should = require('should')
var url = require('url')

var config = require(__dirname + '/../../config')

describe('CouchDB', function () {
  this.timeout(5000)

  beforeEach(function (done) {
      // connection.resetConnections();
    done()
  })

  afterEach(function(done) {
    done()
  })

  describe('constructor', function () {
    it('should be exposed', function (done) {
      CouchDBAdapter.should.be.Function
      done()
    })

    it('should inherit from EventEmitter')

    it('should load config if no options supplied', function (done) {
      var couchdb = new CouchDBAdapter()
      should.exist(couchdb.config)
      done()
    })

    it('should load config from options supplied')
  })

  describe('connect', function () {
    it('should create specified collection if it doesn\'t exist', function (done) {
      var couchdb = new CouchDBAdapter()

      couchdb.connect({ collection: 'users' }).then(() => {
        // var collection = couchdb.database.getCollection('users')
        // should.exist(collection)
        // collection.name.should.eql('users')
        done()
      })
    })

    it('should have readyState == 1 when connected', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'posts' }).then(() => {
        couchdb.readyState.should.eql(1)
        done()
      }).catch(err => {
        done(err)
      })
    })
  })

  describe('insert', function () {
  it('should insert a single document into the database', function (done) {
    var couchdb = new CouchDBAdapter()
    couchdb.connect({ collection: 'users' }).then(() => {
      var user = { name: 'Ernest' }

      couchdb.insert(user, 'users', {}).then((results) => {
        results.constructor.name.should.eql('Array')
        results[0].name.should.eql('Ernest')
        done()
      }).catch(err => {
        done(err)
      })
    })
  })

  it('should insert an array of documents into the database', function (done) {
    var couchdb = new CouchDBAdapter()
    couchdb.connect({ collection: 'users' }).then(() => {
      var users = [{ name: 'Ernest' }, { name: 'Wallace' }]

      couchdb.insert(users, 'users', {}).then((results) => {
        results.constructor.name.should.eql('Array')
        results.length.should.eql(2)
        results[0].name.should.eql('Ernest')
        results[1].name.should.eql('Wallace')
        done()
      }).catch(err => {
        done(err)
      })
    })
  })
})

describe('find', function () {
  it('should find a single document in the database', function (done) {
    var couchdb = new CouchDBAdapter()
    couchdb.connect({ collection: 'users' }).then(() => {
      var users = [{ name: 'Ernest' }, { name: 'Wallace' }]

      couchdb.insert(users, 'users', {}).then((results) => {
        couchdb.find({ name: 'Wallace' }, 'users', {}).then((results) => {
          results.constructor.name.should.eql('Array')
          results[0].name.should.eql('Wallace')
          done()
        })
      })
    })
  })
})
})
