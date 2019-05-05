function getHeaderValueFromOptions (options) {
  var VALID_TYPES = new Set([
    'cache',
    'cookies',
    'storage',
    'executionContexts',
    '*'
  ])

  options = options || {}

  var directives
  if ('directives' in options) {
    directives = options.directives
  } else {
    directives = ['*']
  }

  if (!Array.isArray(directives)) {
    throw new Error('Clear-Site-Data directives must be an array.')
  } else if (directives.length === 0) {
    throw new Error('Clear-Site-Data directives cannot be an empty array.')
  }

  var directivesSet = new Set(directives)
  if (directivesSet.size !== directives.length) {
    throw new Error('Clear-Site-Data directives cannot contain duplicates.')
  } else if (directivesSet.has('*') && (directives.length > 1)) {
    throw new Error('Clear-Site-Data cannot contain "*" and other directives. Remove the other directives or "*".')
  }

  return directives.map(function (directive) {
    if (!VALID_TYPES.has(directive)) {
      throw new Error(directive + ' is not a valid Clear-Site-Data directive.')
    }
    return '"' + directive + '"'
  }).join(',')
}

module.exports = function clearSiteData (options) {
  var headerValue = getHeaderValueFromOptions(options)

  return function clearSiteData (req, res, next) {
    res.setHeader('Clear-Site-Data', headerValue)
    next()
  }
}
