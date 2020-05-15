#!/usr/bin/env node
'use strict';

var path = require('path');
var fs = require('fs');
var shelljs = require('shelljs');
var cli = require('commander');
var cwd = process.cwd();
var installSubsetPackageJson = require('./package.json');
var packageJson = require(cwd + '/package.json');
var spawnSync = require('cross-spawn').sync;
var importFresh = require('import-fresh');

var backup = function(filename) {
  try {
    const originalPath = path.join(cwd, filename)
    const backupPath = originalPath + '.backup'
    fs.writeFileSync(backupPath, fs.readFileSync(originalPath));
  } catch (err) {}
};

var restore = function(filename) {
  try {
    const originalPath = path.join(cwd, filename)
    const backupPath = originalPath + '.backup'
    fs.writeFileSync(originalPath, fs.readFileSync(backupPath));
    fs.unlinkSync(backupPath);
  } catch (err) {}
};

var omit = function(obj, props) {
  return Object.keys(obj)
    .filter(key => props.indexOf(key) < 0)
    .reduce((acc, key) => Object.assign(acc, { [key]: obj[key] }), {});
};

var pick = function(obj, props) {
  return Object.keys(obj)
    .filter(key => props.indexOf(key) >= 0)
    .reduce((acc, key) => Object.assign(acc, { [key]: obj[key] }), {});
};

var getConfigFile = function() {
  let content;
  const filepath = path.resolve(process.cwd(), 'subset.config.js')
  try {
    content = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    content = null;
  }
  if (content === null || (content && content.trim() === '')) return null
  return importFresh(filepath);
}

cli
  .command('install [input_string]')
  .alias('i')
  .option('-d, --clean', 'remove node_modules first')
  .option('--npm', 'use npm to install')
  .option('-a, --all', 'prune dependencies as well as dev dependencies')
  .description('install a given subset defined in package.json')
  .action(function(input_string, options) {
    if (!input_string) {
      throw 'Please provide an install subset name';
    }

    const subsets = packageJson.subsets || getConfigFile() || {};

    if (!Object.keys(subsets).length) {
      throw 'No install subsets in package.json/subset.config.js';
    }

    if (!subsets[input_string]) {
      throw 'No install subset with that name';
    }

    const subset = subsets[input_string];

    // prune devDependencies according to subset declarations and options
    if (subset.include) {
      packageJson.devDependencies = pick(packageJson.devDependencies, subset.include);
    } else if (subset.exclude) {
      packageJson.devDependencies = omit(packageJson.devDependencies, subset.exclude);
    } else {
      throw 'No valid subset actions found';
    }

    if (options.all) {
      // prune dependencies according to subset declarations and options
      if (subset.include) {
        packageJson.dependencies = pick(packageJson.dependencies, subset.include);
      } else if (subset.exclude) {
        packageJson.dependencies = omit(packageJson.dependencies, subset.exclude);
      } else {
        throw 'No valid subset actions found';
      }
    }

    // backup package.json and lockfiles to restore later
    backup('package.json');
    backup('package-lock.json');
    backup('yarn.lock');

    if (options.clean) {
      shelljs.rm('-rf', path.join(cwd, 'node_modules'));
    }

    try {
      // write the new temp package.json
      fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(packageJson, null, '  '));

      // choose which installer to use, then spawn
      if (!options.npm && shelljs.which('yarn')) {
        var installer = spawnSync('yarn', ['install'], { stdio: 'inherit' });
      } else {
        var installer = spawnSync('npm', ['install'], { stdio: 'inherit' });
      }
    } catch (err) {} // err doesn't matter, need to perform cleanup operations

    // restore package.json and lockfiles from backup
    restore('package.json');
    restore('package-lock.json');
    restore('yarn.lock');

    if (installer.status !== 0) {
      throw 'Error code ' + installer.status;
    }

    console.log('Installation of subset "' + input_string + '" successful');
  });

cli.command('config').action(() => {
  const subsets = packageJson.subsets || getConfigFile() || {};
  console.log(subsets);
})

cli.command('*').action(() => cli.help());

cli.version(installSubsetPackageJson.version).parse(process.argv);

if (cli.args.length === 0) cli.help();

process.on('uncaughtException', err => {
  console.log('ERROR: ' + err);
});
