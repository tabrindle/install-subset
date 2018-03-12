# install-subset

Stop installing npm devDependencies that you don't need.

**You can exclude some npm devDependencies with install-subset when you don't need them**.

Consider:
- A CI server for your builds: you may not need your linting or testing tools. With a busy or shared server, you can save precious time.
- A data generation library you only need once.
- Toolsets that only a certain team member needs or uses, depending on their job, IDE or preferences.

Even with npm 5 and yarn, **installing node modules can be a long and painful task**. Sometimes you have to build a native bindings like node-sass or couchbase, and sometimes you just have 100,000 dependencies. You are at the mercy of:
- your connection speed & latency
- your computer's willingness to cooperate
- the number of dependencies
- the [disk space available](http://devhumor.com/content/uploads/images/August2017/node-modules.jpg)
- your patience

## Installation

`npm install -g install-subset`

## Usage

Add something like to your package.json:
```
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
  }
}
```

In your terminal: `$ subset install test`

This installs your normal dependencies, minus eslint and prettier.

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
