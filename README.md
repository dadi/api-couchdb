# API CouchDB Adapter

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/api-couchdb.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/api-couchdb)
[![Coverage Status](https://coveralls.io/repos/github/dadi/api-couchdb/badge.svg?branch=master)](https://coveralls.io/github/dadi/api-couchdb?branch=master)
[![Build Status](https://travis-ci.org/dadi/api-couchdb.svg?branch=master)](https://travis-ci.org/dadi/api-couchdb)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

## Requirements

* [DADI API](https://www.npmjs.com/package/@dadi/api) Version 2.0.0 or greater

## Tests

To run the test suite you'll need a CouchDB server running on localhost with the default port of 5984. If you've changed the default port, modify the test configuration file at `config/couchdb.test.json`. This file is created from `config/couchdb.test.json.sample` the first time the test suite is run.

Run the tests:

```bash
$ git clone https://github.com/dadi/api-couchdb.git
$ cd api-couchdb
$ npm test
```

## Configure

### Configuration Files

Configuration settings are defined in JSON files within a `/config` directory at the root of your API application. DADI API has provision for multiple configuration files, one for each environment that your API is expected to run under: `development`, `qa` and `production`.

The naming convention for CouchDB configuration files follows the format `couchdb.<environment>.json`

For example:

```
couchdb.development.json
couchdb.qa.json
couchdb.production.json
```

### Application Anatomy

```sh
my-api/
  config/            # contains environment-specific
                     # configuration properties
    config.development.json
    config.qa.json
    config.production.json
    couchdb.development.json
    couchdb.qa.json
    couchdb.production.json

  main.js            # the entry point of the app

  package.json

  workspace/
    collections/     # collection schema files
    endpoints/       # custom Javascript endpoints

```

### Configuration

[TODO]