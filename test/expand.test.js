const expand = require('../src/expand');

const mockDependencies = {
  commander: '^2.11.0',
  'cross-spawn': '^6.0.5',
  'import-fresh': '^3.2.1',
  shelljs: '^0.7.8',
};

describe('Test string and regular expression subset config', () => {
  test('string matches pass through', () => {
    const expanded = expand(mockDependencies, ['commander', 'shelljs']).sort();
    expect(expanded).toEqual(['commander', 'shelljs']);
  });

  test('regex matches expand', () => {
    const expanded = expand(mockDependencies, [/c.*/]).sort();
    expect(expanded).toEqual(['commander', 'cross-spawn']);
  });

  test('regex matches expand that do not overlap', () => {
    const expanded = expand(mockDependencies, [/co.*/, /cr.*/]).sort();
    expect(expanded).toEqual(['commander', 'cross-spawn']);
  });

  test('regex matches expand and but do not duplicate', () => {
    const expanded = expand(mockDependencies, [/c.*/, /cr.*/]).sort();
    expect(expanded).toEqual(['commander', 'cross-spawn']);
  });

  test('string and regex matches', () => {
    const expanded = expand(mockDependencies, ['shelljs', /c.*/]).sort();
    expect(expanded).toEqual(['commander', 'cross-spawn', 'shelljs']);
  });
});
