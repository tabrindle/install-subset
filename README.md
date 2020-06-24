<p align="center">
  <img src="https://raw.githubusercontent.com/tabrindle/install-subset/master/logo.png" align="center"  width="700px"/>
  <h3 align="center">Stop installing npm dependencies that you don't need.</h3>
  <hr/>
</p>

[![npm version](https://badge.fury.io/js/install-subset.svg)](https://badge.fury.io/js/install-subset)
[![npm downloads per month](https://img.shields.io/npm/dm/install-subset.svg?maxAge=86400)](https://www.npmjs.com/package/install-subset)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**You can exclude some npm dependencies with install-subset when you don't need them**.

Consider:

- A CI server for your builds: you may not need your linting or testing tools. With a busy or shared server, you can save precious time.
- A data generation library you only need once.
- Toolsets that only a certain team member needs or uses, depending on their job, IDE or preferences.
- Developing an application out of a monorepo that only needs certain dependencies for certain environments. (e.g. Mobile, Web, Desktop, or a Docker container)

Even with npm 5 and yarn, **installing node modules can be a long and painful task**. Sometimes you have to build a native bindings like node-sass or couchbase, and sometimes you just have 100,000 dependencies. You are at the mercy of:

- Your connection speed & latency.
- Your computer's willingness to cooperate.
- The number of dependencies.
- The [disk space available](http://devhumor.com/content/uploads/images/August2017/node-modules.jpg).
- Your patience.

## Installation

`npm install -g install-subset`

## Usage

Add something like this to your package.json...

```json
"subsets": {
  "build": {
    "include": [
      "babel-cli",
      "dotenv",
      "webpack"
    ]
  },
  "test": {
    "exclude": [
      "eslint",
      "prettier"
    ]
  },
  "container": {
    "exclude": [
      "nativescript",
      "serverless",
      "ngrok"
    ]
  }
}
```

Or, you can use a subset.config.js file for more flexibility:
```
const both = [
  'dotenv'
]

module.exports = {
  build: {
    include: [
      'babel-cli',
      'webpack',
      ...both
    ]
  },
  test: {
    exclude: [
      'eslint',
      'prettier',
      ...both
    ]
  }
}
```

In your terminal: `$ subset install test`

This installs all of your application `dependencies`, excluding eslint and prettier, which are listed under your `devDependencies`.

If you would like install-subset to consider all of the dependencies of your application when evaluating subsets...

In your terminal: `$ subset install container --all`

If you would like install-subset to consider multiple subsets...

In your terminal: `$subset install test container`

## Case Study

[fakeit](https://github.com/bentonam/fakeit) is an amazing fake data generation library with support for couchbase, complicated related data models, multiple export options and more. However, its dependency tree is large, and has a dependency on a native Couchbase binary. In an example React Native project, just excluding this one rarely used devDependency cuts install time by around 29 seconds. 

Warm cache, yarn v1.5.1, fresh install, without `install-subset`
```
  rm -rf node_modules && yarn
  ...
  real    0m40.496s
  user    0m32.451s
  sys     0m11.309s
```

Warm cache, yarn v1.5.1, fresh install  With `install-subset` excluding [fakeit](https://github.com/bentonam/fakeit)
```
  rm -rf node_modules && subset install "development"
  ...
  real    0m11.157s
  user    0m9.261s
  sys     0m6.134s
```
