phosphor-boxpanel
=================

[![Build Status](https://travis-ci.org/phosphorjs/phosphor-boxpanel.svg)](https://travis-ci.org/phosphorjs/phosphor-boxpanel?branch=master)
[![Coverage Status](https://coveralls.io/repos/phosphorjs/phosphor-boxpanel/badge.svg?branch=master&service=github)](https://coveralls.io/github/phosphorjs/phosphor-boxpanel?branch=master)

A Phosphor layout widget which arranges its children into a single row or column.

[API Docs](http://phosphorjs.github.io/phosphor-boxpanel/api/)


Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)

```bash
npm install --save phosphor-boxpanel
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/phosphorjs/phosphor-boxpanel.git
cd phosphor-boxpanel
npm install
```

**Rebuild**
```bash
npm run clean
npm run build
```


Run Tests
---------

Follow the source build instructions first.

```bash
# run tests in Firefox
npm test

# run tests in Chrome
npm run test:chrome

# run tests in IE
npm run test:ie
```


Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.


Build Example
-------------

Follow the source build instructions first.

```bash
npm run build:example
```

Navigate to `example/index.html`.


Supported Runtimes
------------------

The runtime versions which are currently *known to work* are listed below.
Earlier versions may also work, but come with no guarantees.

- IE 11+
- Firefox 32+
- Chrome 38+


Bundle for the Browser
----------------------

Follow the package install instructions first.

```bash
npm install --save-dev browserify browserify-css
browserify myapp.js -t browserify-css -o mybundle.js
```


Usage Examples
--------------

**Note:** This module is fully compatible with Node/Babel/ES6/ES5. Simply
omit the type declarations when using a language other than TypeScript.
