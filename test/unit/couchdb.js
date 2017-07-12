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

  describe('collection name', function () {
    it('should be dasherized when it is camelCase', function (done) {
      var couchdb = new CouchDBAdapter()
      var collection = 'tokenStore'

      couchdb.getCollectionName(collection).should.eql('token-store')
      done()
    })
  })

  describe('translate', function () {
    it('should replace underscores with $', function (done) {
      var couchdb = new CouchDBAdapter()
      var user = { name: 'Ernest', _special: 'xyz' }

      couchdb.translate(user).should.eql({ name: 'Ernest', $special: 'xyz' })
      done()
    })

    it('should replace $ with underscores', function (done) {
      var couchdb = new CouchDBAdapter()
      var user = { name: 'Ernest', $special: 'xyz' }

      couchdb.translate(user, true).should.eql({ name: 'Ernest', _special: 'xyz' })
      done()
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

    it('should return only the fields specified by the `fields` property', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'users' }).then(() => {
        var users = [{ name: 'Ernie', age: 7, colour: 'yellow' }, { name: 'Oscar', age: 9, colour: 'green' }, { name: 'BigBird', age: 13, colour: 'yellow' }]

        couchdb.insert(users, 'users', {}).then((results) => {
          couchdb.find({ colour: 'yellow' }, 'users', { fields: { name: 1, age: 1 } }).then((results) => {
            results.constructor.name.should.eql('Array')

            var user = results[0]

            should.exist(user.name)
            should.exist(user.age)
            should.exist(user._id)
            should.not.exist(user.colour)
            done()
          }).catch((err) => {
            done(err)
          })
        })
      })
    })
  })

  describe('update', function () {
    it('should update a single document matching a query', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'users' }).then(() => {
        var users = [{ name: 'Ernesto' }, { name: 'William Wallace' }]

        couchdb.insert(users, 'users', {}).then((results) => {
          couchdb.update({ name: 'William Wallace' }, 'users', { name: 'Wally', free: true }, {}).then((results) => {
            results.constructor.name.should.eql('Array')
            results[0].name.should.eql('Wally')
            should.exist(results[0].free)
            done()
          })
        })
      })
    })

    it('should return an empty array when no documents match', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'users' }).then(() => {
        var users = [{ name: 'Ernesto' }, { name: 'William Wallace' }]

        couchdb.insert(users, 'users', {}).then((results) => {
          couchdb.update({ name: 'Bob' }, 'users', { name: 'Wally', free: true }, {}).then((results) => {
            results.constructor.name.should.eql('Array')
            results.length.should.eql(0)
            done()
          })
        })
      })
    })
  })

  describe('delete', function () {
    it('should return 0 when no documents match a query', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'users' }).then(() => {
        var users = [{ name: 'Aunt Billie' }, { name: 'Uncle Joe' }]

        couchdb.insert(users, 'users', {}).then((results) => {
          couchdb.delete({ name: 'Wilfred' }, 'users').then((results) => {
            should.exist(results.deletedCount)
            results.deletedCount.should.eql(0)
            done()
          })
        })
      })
    })

    it('should delete a single document matching a query', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'users' }).then(() => {
        var users = [{ name: 'Uncle Bill' }, { name: 'Uncle Sam' }]

        couchdb.insert(users, 'users', {}).then((results) => {
          couchdb.delete({ _id: results[0]._id }, 'users').then((results) => {
            should.exist(results.deletedCount)
            results.deletedCount.should.eql(1)
            done()
          })
        })
      })
    })

    it('should delete all documents matching a query', function (done) {
      var couchdb = new CouchDBAdapter()
      couchdb.connect({ collection: 'users' }).then(() => {
        var users = [{ name: 'Uncle Bill', uncle: true }, { name: 'Uncle Sam', uncle: true }]

        couchdb.insert(users, 'users', {}).then((results) => {
          couchdb.delete({ uncle: true }, 'users').then((results) => {
            should.exist(results.deletedCount)
            results.deletedCount.should.eql(2)
            done()
          })
        })
      })
    })
  })
})
