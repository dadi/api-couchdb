var EventEmitter = require('events').EventEmitter
var CouchDBAdapter = require('../../lib')
var querystring = require('querystring')
var should = require('should')
var url = require('url')

var config = require(__dirname + '/../../config')

describe('CouchDB', function () {
  this.timeout(2000)

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

    it('should have readyState == 0 when initialised')
  })
})
