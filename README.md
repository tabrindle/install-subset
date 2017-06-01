# install-subset

Create npm installation subsets to save time

Even with npm 5 and yarn, installing node modules can be a long and painful task. You are at the mercy of:
- your connection speed/latency
- the registry servers
- the number of dependencies
- the disk space available
- etc

Worse, sometimes you have to build a native binding like node-sass or couchbase, which requires:
- time
- processor power
- battery
- patience

You can cleverly avoid some devDependencies in certain contexts. For example, on a CI server where you are simply building an artifact, you do not need to install dependencies like eslint, karma, or other testing frameworks. With a busy or shared server, you can shave precious time off of each build this way. 

## Example

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

Then call `subset install test`

## Info

- 'build' and 'test' are subset names
- 'whitelist' and 'blacklist' are methods of install
    - 'whitelist' allows that subset of your devDependencies to install
    - 'blacklist' disallows that subset of your devDependencies to install
- package.json will be temporarily changed, and restored after install


## Caution

This is very beta. Do not blame me if your project no longer works, you mess up your package.json, or your coworkers do not understand what you are doing. If you break something with a subset, remove and reinstall your node_modules in the normal way. 
