Clear Site Data
===============
[![Build Status](https://travis-ci.org/helmetjs/clearsitedata.svg?branch=master)](https://travis-ci.org/helmetjs/clearsitedata)

The [Clear-Site-Data HTTP header](https://w3c.github.io/webappsec-clear-site-data/) allows you to instruct browsers to clear all of their local data (caches, cookies, etc). This is useful in a number of cases, like when a user logs out.

Usage:

```javascript
const clearSiteData = require('clearsitedata')

// Clear everything
app.post('/logout', clearSiteData({
  directives: ['*']
}))

// Clearing everything is the default
app.post('/logout', clearSiteData())

// Only clear cookies and storage
app.post('/logout', clearSiteData({
  directives: ['cookies', 'storage']
}))
```
