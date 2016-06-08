var clearSiteData = require('..')

var connect = require('connect')
var request = require('supertest')
var assert = require('assert')

describe('clearSiteData', function () {
  function hello (req, res) {
    res.end('Hello world!')
  }

  beforeEach(function () {
    this.app = connect()
  })

  it('sets the full header when passed no arguments', function (done) {
    this.app.use(clearSiteData()).use(hello)

    request(this.app).get('/').end(function (err, res) {
      if (err) { return done(err) }

      var value = JSON.parse(res.headers['clear-site-data'])
      assert.deepEqual(value, {
        types: [
          'cache',
          'cookies',
          'storage',
          'executionContexts'
        ]
      })

      done()
    })
  })

  it('sets the full header when passed no type', function (done) {
    this.app.use(clearSiteData({})).use(hello)

    request(this.app).get('/').end(function (err, res) {
      if (err) { return done(err) }

      var value = JSON.parse(res.headers['clear-site-data'])
      assert.deepEqual(value, {
        types: [
          'cache',
          'cookies',
          'storage',
          'executionContexts'
        ]
      })

      done()
    })
  })

  it('can customize the header', function (done) {
    this.app.use(clearSiteData({
      types: [
        'cache',
        'cookies'
      ]
    })).use(hello)

    request(this.app).get('/').end(function (err, res) {
      if (err) { return done(err) }

      var value = JSON.parse(res.headers['clear-site-data'])
      assert.deepEqual(value, {
        types: [
          'cache',
          'cookies'
        ]
      })

      done()
    })
  })

  it('throws an error when given no types', function () {
    assert.throws(function () {
      clearSiteData({
        types: []
      })
    })
  })

  it('throws an error when given an invalid type', function () {
    assert.throws(function () {
      clearSiteData({
        types: ['cache', 'garbage']
      })
    })
  })
})
