module.exports = function pick(obj, props) {
  return Object.keys(obj)
    .filter((key) => props.indexOf(key) >= 0)
    .reduce((acc, key) => Object.assign(acc, { [key]: obj[key] }), {})
}
