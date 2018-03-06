# install-subset

Stop installing dependencies that you don't need.

Even with npm 5 and yarn, **installing node modules can be a long and painful task**. Sometimes you have to build a native bindings like node-sass or couchbase, and sometimes you just have 100,000 dependencies. You are at the mercy of:
- your connection speed & latency
- your computer's willingness to cooperate
- the number of dependencies
- the [disk space available](http://devhumor.com/content/uploads/images/August2017/node-modules.jpg)
- your patience

**You can cleverly avoid installing some devDependencies in certain contexts**. For example, on a CI server where you are simply building an artifact, you do not need to install dependencies like eslint, karma, or other testing frameworks. With a busy or shared server, you can shave precious time off of each build this way. 

## Installation

`npm install -g install-subset`

## Usage

Add something like to your package.json:
```
"subsets": {
  "build": {
    "whitelist": [
      "babel-cli",
      "dotenv"
    ]
  },
  "test": {
    "blacklist": [
      "eslint",
      "lint-rules",
      "prettier"
    ]
  }
}
```

In your terminal: `$ subset install test`

## Case Study

[fakeit](https://github.com/bentonam/fakeit) is an amazing fake data generation library with support for couchbase, complicated related data models, multiple export options and more. However, its dependency tree is large, and has a dependency on a native Couchbase binary. In an example React Native project, just blacklisting this one rarely used devDependency cuts install time by around 29 seconds. 

Warm cache, yarn v0.24.5, fresh install, without `install-subset`
```
rm -rf node_modules && yarn
...
real    0m40.496s
user    0m32.451s
sys     0m11.309s
```

Warm cache, yarn v0.24.5, fresh install  With `install-subset` blacklisting [fakeit](https://github.com/bentonam/fakeit)
```
rm -rf node_modules && subset install "development"
...
real    0m11.157s
user    0m9.261s
sys     0m6.134s
```

## Caution

This is still very beta. Do not blame me if your project no longer works, you mess up your package.json, or your coworkers do not understand what you are doing. If you break something with a subset, remove and reinstall your node_modules in the normal way. 
