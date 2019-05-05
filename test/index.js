var clearSiteData = require('..')

var connect = require('connect')
var request = require('supertest')
var assert = require('assert')

var WHITELIST = [
  'cache',
  'cookies',
  'executionContexts',
  'storage',
  '*'
]

function app (middleware) {
  const result = connect()
  result.use(middleware)
  result.use((req, res) => {
    res.end('Hello world!')
  })
  return result
}

describe('clearSiteData', function () {
  it('sets the header to "*" when passed no arguments', function () {
    return request(app(clearSiteData())).get('/')
      .expect('Clear-Site-Data', '"*"')
  })

  it('sets the header to "*" when passed an empty object', function () {
    return request(app(clearSiteData())).get('/')
      .expect('Clear-Site-Data', '"*"')
  })

  WHITELIST.forEach(directive => {
    it('can set just one value, ' + directive, function () {
      const expectedHeaderValue = '"' + directive + '"'
      return request(app(clearSiteData({
        directives: [directive]
      }))).get('/')
        .expect('Clear-Site-Data', expectedHeaderValue)
    })
  })

  it('can set all the header values (other than *)', function () {
    const directives = WHITELIST.filter(directive => directive !== '*').sort()

    return request(app(clearSiteData({
      directives: directives
    }))).get('/').then(response => {
      const actualDirectivesSorted = response
        .get('Clear-Site-Data')
        .split(/,\s*/g)
        .map(quoted => quoted.replace(/"/g, ''))
        .sort()
      assert.deepStrictEqual(actualDirectivesSorted, directives)
    })
  })

  it('throws an error when given no directives', function () {
    assert.throws(function () {
      clearSiteData({ directives: [] })
    })
  })

  it('throws an error when given an invalid directive', function () {
    assert.throws(function () {
      clearSiteData({ directives: ['cache', 'garbage'] })
    })
  })

  it('throws an error when duplicates are provided', function () {
    assert.throws(clearSiteData.bind(null, {
      directives: ['cache', 'cookies', 'cache']
    }))
  })

  it('throws an error when * is provided and other values are also provided', function () {
    assert.throws(clearSiteData.bind(null, {
      directives: ['*', 'cookies']
    }))
    assert.throws(clearSiteData.bind(null, {
      directives: ['cookies', '*']
    }))
    assert.throws(clearSiteData.bind(null, {
      directives: ['*', '*']
    }))
  })

  it('throws an error when given a non-array type', function () {
    assert.throws(function () {
      clearSiteData({ directives: 'cache' })
    })
  })

  it('names its function and middleware', function () {
    assert.strictEqual(clearSiteData.name, 'clearSiteData')
    assert.strictEqual(clearSiteData().name, 'clearSiteData')
  })
})
