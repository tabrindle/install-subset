const fs = require('fs')
const path = require('path')

module.exports = function backup(filename) {
  try {
    const originalPath = path.join(process.cwd(), filename)
    const backupPath = originalPath + '.backup'
    fs.writeFileSync(backupPath, fs.readFileSync(originalPath))
  } catch (err) {}
}
