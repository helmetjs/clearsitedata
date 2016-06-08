var DEFAULT_TYPES = [
  'cache',
  'cookies',
  'storage',
  'executionContexts'
]
var VALID_TYPES = DEFAULT_TYPES

module.exports = function clearSiteData (options) {
  options = options || {}

  var types = options.types || DEFAULT_TYPES
  checkTypes(types)

  var value = JSON.stringify({ types: types })

  return function clearSiteData (req, res, next) {
    res.setHeader('Clear-Site-Data', value)
    next()
  }
}

function checkTypes (types) {
  if (!Array.isArray(types)) {
    throw new Error('types is not an array.')
  }

  if (types.length === 0) {
    throw new Error('types cannot be an empty array.')
  }

  types.forEach(function (type) {
    if (VALID_TYPES.indexOf(type) === -1) {
      throw new Error(type + ' is not a valid type.')
    }
  })
}
