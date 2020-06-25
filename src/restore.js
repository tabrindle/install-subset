const fs = require('fs')
const path = require('path')

module.exports = function restore(filename) {
  try {
    const originalPath = path.join(process.cwd(), filename)
    const backupPath = originalPath + '.backup'
    fs.writeFileSync(originalPath, fs.readFileSync(backupPath))
    fs.unlinkSync(backupPath)
  } catch (err) {}
}
