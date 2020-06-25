const fs = require('fs')
const importFresh = require('import-fresh')
const path = require('path')

module.exports = function config() {
  let content
  const filepath = path.resolve(process.cwd(), 'subset.config.js')
  try {
    content = fs.readFileSync(filepath, 'utf8')
  } catch (e) {
    content = null
  }
  if (content === null || (content && content.trim() === '')) return null
  return importFresh(filepath)
}
