module.exports = {
  multiply: (a, b) => a * b,
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  eq: (a, b) => a === b,
  range: (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
};