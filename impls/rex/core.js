const { Env } = require('./env');
const { MalList, MalValue, MalNil } = require('./types');
const { isDeepStrictEqual } = require('util');

const add = (a, b) => new MalValue(a.value + b.value);
const sub = (a, b) => new MalValue(a.value - b.value);
const mul = (a, b) => new MalValue(a.value * b.value);
const div = (a, b) => new MalValue(a.value / b.value);

const equals = (a, b) => isDeepStrictEqual(a, b);
const greaterThan = (a, b) => a > b;
const lessThan = (a, b) => a < b;
const lessThanEqual = (a, b) => a <= b;
const greaterThanEqual = (a, b) => a >= b;

const isList = (arg) => {
  return arg instanceof MalList;
}

const isEmpty = (args) => {
  return args.value.length === 0;
}

const countOf = (args) => {
  if (args instanceof MalNil) {
    return new MalValue(0);
  }

  return new MalValue(args.count());
}

const binaryOperator = (pred) => (...args) => {
  for (let i = 1; i < args.length; i++) {
    const LHS = args[i - 1].value;
    const RHS = args[i].value;

    if (!(pred(LHS, RHS))) {
      return false;
    }
  }

  return true;
}

module.exports = {
  add, sub,
  mul, div,
  equals, greaterThan,
  lessThan,
  lessThanEqual,
  greaterThanEqual,
  isList,
  isEmpty, countOf,
  binaryOperator
};
