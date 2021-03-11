const fs = require('fs')
const path = require('path')
const shelljs = require('shelljs')
const spawnSync = require('cross-spawn').sync
const backup = require('./backup')
const expand = require('./expand')
const getConfig = require('./config')
const omit = require('./omit')
const pick = require('./pick')
const restore = require('./restore')
const packageJson = require(path.join(process.cwd(), 'package.json'))

module.exports = function install(input_strings, options) {
  const config = packageJson.subsets || getConfig() || {}

  if (!Object.keys(config).length) {
    console.error('No install subsets in package.json/subset.config.js')
    process.exit(1)
  }

  const subsetStrings = []

  if (input_strings.length >= 1) {
    for (let string of input_strings) {
      subsetStrings.push(string)
    }
  }

  let subset = {}
  for (let i = 0; i < subsetStrings.length; i++) {
    const packageSubset = config[subsetStrings[i]]
    if (!packageSubset) {
      console.error(`No install subset with name ${subsetStrings[i]} was found.`)
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

  if (subset.include && subset.exclude) {
    console.error(`Failed to install subset ${input_string}.`)
    console.error(
      'Subsets can only include OR exclude packages. Please correct your subset or combination of subsets and try again.'
    )
    process.exit(1)
  }

  // prune devDependencies according to subset declarations and options
  if (subset.include) {
    packageJson.devDependencies = pick(
      packageJson.devDependencies,
      expand(packageJson.devDependencies, subset.include)
    )
  } else if (subset.exclude) {
    packageJson.devDependencies = omit(
      packageJson.devDependencies,
      expand(packageJson.devDependencies, subset.exclude)
    )
  } else {
    console.error('No valid subset actions found.')
    process.exit(1)
  }

  if (options.all) {
    // prune dependencies according to subset declarations and options
    if (subset.include) {
      packageJson.dependencies = pick(
        packageJson.dependencies,
        expand(packageJson.dependencies, subset.include)
      )
    } else if (subset.exclude) {
      packageJson.dependencies = omit(
        packageJson.dependencies,
        expand(packageJson.dependencies, subset.exclude)
      )
    } else {
      console.error('No valid subset actions found.')
      process.exit(1)
    }
  }

  // backup package.json and lockfiles to restore later
  backup('package.json')
  backup('package-lock.json')
  backup('yarn.lock')

  if (options.clean) {
    shelljs.rm('-rf', path.join(process.cwd(), 'node_modules'))
  }

  let installer

  try {
    // write the new temp package.json
    fs.writeFileSync(
      path.join(process.cwd(), 'package.json'),
      JSON.stringify(packageJson, null, '  ')
    )

    // choose which installer to use, then spawn
    if (!options.npm && shelljs.which('yarn')) {
      installer = spawnSync('yarn', ['install'], { stdio: 'inherit' })
    } else {
      installer = spawnSync('npm', ['install'], { stdio: 'inherit' })
    }
  } catch (err) {} // err doesn't matter, need to perform cleanup operations

  // restore package.json and lockfiles from backup
  restore('package.json')
  restore('package-lock.json')
  restore('yarn.lock')

  if (installer.status !== 0) {
    console.error(`Error code ${installer.status}.`)
    process.exit(1)
  }

  for (let input_string of subsetStrings) {
    console.log(`Installation of subset ${input_string} successful.`)
  }
}
