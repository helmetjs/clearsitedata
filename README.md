Clear Site Data
===============
[![Build Status](https://travis-ci.org/helmetjs/clearsitedata.svg?branch=master)](https://travis-ci.org/helmetjs/clearsitedata)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

The [Clear-Site-Data HTTP header](https://w3c.github.io/webappsec-clear-site-data/) allows you to instruct browsers to clear all of their local data (caches, cookies, etc). This is useful in a number of cases, like when a user logs out.

Usage:

```javascript
var clearSiteData = require('clearsitedata')

// Clear everything
app.get('/logout', clearSiteData({
  types: [
    'cache',
    'cookies',
    'storage',
    'executionContexts'
  ]
}))

// Clearing everything is the default
app.get('/logout', clearSiteData())

// Only clear cookies
app.get('/logout', clearSiteData({
  types: ['cookies']
}))
```
