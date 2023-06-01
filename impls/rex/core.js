const { isDeepStrictEqual } = require('util');

const { Env } = require('./env');
const { MalList, MalValue, MalNil, MalSymbol } = require('./types');
const { pr_str } = require('./printer');

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

const createList = (...args) => {
  return new MalList(args);
}

const printAst = (...args) => {
  console.log(...args.map(item => pr_str(item)));
  return new MalNil();
}

const notOf = (arg) => {
  return !(arg && arg !== null);
}


const env = new Env(null);
env.set(new MalSymbol('+'), (...args) => (args.reduce(add)));
env.set(new MalSymbol('-'), (...args) => (args.reduce(sub)));
env.set(new MalSymbol('*'), (...args) => (args.reduce(mul)));
env.set(new MalSymbol('/'), (...args) => (args.reduce(div)));
env.set(new MalSymbol('='), binaryOperator(equals));
env.set(new MalSymbol('>'), binaryOperator(greaterThan));
env.set(new MalSymbol('>='), binaryOperator(greaterThanEqual));
env.set(new MalSymbol('<'), binaryOperator(lessThan));
env.set(new MalSymbol('<='), binaryOperator(lessThanEqual));
env.set(new MalSymbol('count'), countOf);
env.set(new MalSymbol('prn'), printAst);
env.set(new MalSymbol('pr-str'), printAst);
env.set(new MalSymbol('println'), printAst);
env.set(new MalSymbol('list'), createList);
env.set(new MalSymbol('list?'), isList);
env.set(new MalSymbol('empty?'), isEmpty);
env.set(new MalSymbol('not'), notOf);


module.exports = {
  add, sub,
  mul, div,
  equals, greaterThan,
  lessThan,
  lessThanEqual,
  greaterThanEqual,
  isList,
  isEmpty, countOf,
  binaryOperator,
  env
};
