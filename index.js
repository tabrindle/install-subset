#!/usr/bin/env node
'use strict'

const path = require('path')
const cli = require('commander')
const install = require('./src/install')

cli
  .command('install <input_strings...>')
  .alias('i')
  .option('-d, --clean', 'Remove node_modules first.')
  .option('--npm', 'Use npm to install.')
  .option('-a, --all', 'Prune dependencies as well as devDependencies.')
  .description('Install a given subset or multiple subsets defined in package.json.')
  .action(install)

cli.command('config').action(() => {
  const config = require('./src/config')
  const subsets = require(process.cwd() + '/package.json').subsets || config() || {}
  console.log(subsets)
})

cli.command('*').action(() => cli.help())

cli.version(require('./package.json').version).parse(process.argv)

if (cli.args.length === 0) cli.help()

process.on('uncaughtException', (err) => {
  console.error('ERROR: ' + err)
  process.exit(1)
})
