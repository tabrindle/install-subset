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

cli
  .command('install <input_strings...>')
  .alias('i')
  .option('-d, --clean', 'Remove node_modules first.')
  .option('--npm', 'Use npm to install.')
  .option('-a, --all', 'Prune dependencies as well as devDependencies.')
  .description('Install a given subset or multiple subsets defined in package.json.')
  .action(function(input_strings, options) {

    if (!packageJson.subsets) {
      console.error('No install subsets in package.json.')
      process.exit(1)
    }

    const subsetStrings = new Array()

    if (input_strings.length >= 1) {
        for (let string of input_strings) {
          subsetStrings.push(string)
        }
    }

    let subset = {}
    for(var i=0; i < subsetStrings.length; i++) {
      const packageSubset = packageJson.subsets[subsetStrings[i]]
      if (!packageSubset) {
        console.error('No install subset with name ' + subsetStrings[i] + ' was found.')
        process.exit(1)
      }
      if (packageSubset.exclude) {
        if (!subset.exclude) {
          subset.exclude = []
        }
        subset.exclude = [...subset.exclude, ...packageSubset.exclude]
      }
      if (packageSubset.include) {
        if (!subset.include) {
          subset.include = []
        }
        subset.include = [...subset.include, ...packageSubset.include]
      }
    }

    // prune devDependencies according to subset declarations and options
    if (subset.include) {
      packageJson.devDependencies = pick(packageJson.devDependencies, subset.include);
    } else if (subset.exclude) {
      packageJson.devDependencies = omit(packageJson.devDependencies, subset.exclude);
    } else {
      console.error('No valid subset actions found.')
      process.exit(1)
    }

    if (options.all) {
      // prune dependencies according to subset declarations and options
      if (subset.include) {
        packageJson.dependencies = pick(packageJson.dependencies, subset.include);
      } else if (subset.exclude) {
        packageJson.dependencies = omit(packageJson.dependencies, subset.exclude);
      } else {
        console.error('No valid subset actions found.')
        process.exit(1)
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

      console.error('Error code ' + installer.status + '.')
      process.exit(1)
    }

    for (let input_string of subsetStrings) {
      console.log('Installation of subset "' + input_string + '" successful.');
    }
  });

cli.command('*').action(() => cli.help());

cli.version(installSubsetPackageJson.version).parse(process.argv);

if (cli.args.length === 0) cli.help();

process.on('uncaughtException', err => {
  console.error('ERROR: ' + err);
  process.exit(1)
});
