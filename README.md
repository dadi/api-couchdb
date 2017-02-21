# API CouchDB Adapter

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/api-couchdb.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/api-couchdb)
[![coverage](https://img.shields.io/badge/coverage-78%25-yellow.svg?style=flat-square)](https://github.com/dadi/api-couchdb)
[![Build Status](https://travis-ci.org/dadi/api-couchdb.svg?branch=master)](https://travis-ci.org/dadi/api-couchdb)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

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