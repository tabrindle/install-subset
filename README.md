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
