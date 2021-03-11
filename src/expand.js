module.exports = function expand(original, matcherList) {
  return Array.from(
    new Set(
      matcherList.reduce((acc, val) => {
        if (val.constructor.name === 'RegExp') {
          acc = acc.concat(Object.keys(original).filter((item) => val.test(item)))
        }
        if (typeof val === 'string') {
          acc.push(val)
        }
        return acc
      }, [])
    )
  )
}
