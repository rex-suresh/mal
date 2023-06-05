const { isDeepStrictEqual } = require('util');
const fs = require('fs');

const { Env } = require('./env');
const { MalList, MalValue, MalNil, MalSymbol, MalString, MalAtom, createMalString } = require('./types');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');

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

const printLn = (...args) => {
  console.log(args.map(
    (item) => pr_str(item, false)).join(' '));
  return new MalNil();
}

const prn = (...args) => {
  console.log(args.map(
    (item) => pr_str(item, true)).join(' '));
  return new MalNil();
}

const str = (...args) => {
  return new
    MalString(args.map((item) => pr_str(item, false)).join(''));
}

const pr_str_fn = (...args) => {
  return new
    MalString(args.map((arg) => pr_str(arg, true)).join(' '));
}

const notOf = (arg) => {
  return !(arg && !(arg instanceof MalNil));
}

const env = new Env(null, [], []);
const ns = {
  '+': (...args) => (args.reduce(add)),
  '-': (...args) => (args.reduce(sub)),
  '*': (...args) => (args.reduce(mul)),
  '/': (...args) => (args.reduce(div)),
  '=': binaryOperator(equals),
  '>': binaryOperator(greaterThan),
  '>=': binaryOperator(greaterThanEqual),
  '<': binaryOperator(lessThan),
  '<=': binaryOperator(lessThanEqual),
  'count': countOf,
  'list': createList,
  'list?': isList,
  'empty?': isEmpty,
  'not': notOf,
  'str': str,
  'prn': prn,
  'pr-str': pr_str_fn,
  'println': printLn,
  'read-string': (string) => read_str(pr_str(string.value, false)),
  'slurp': (filename) =>
    createMalString(fs.readFileSync(filename.value, 'utf-8')),
  'atom': (value) => new MalAtom(value),
  'atom?': (value) => value instanceof MalAtom,
  'deref': (atom) => atom.deref(),
  'reset!': (atom, value) => atom.reset(value),
  'swap!': (atom, fn, ...args) => atom.swap(fn, args),
};

const bindNS = () => {
  Object.entries(ns).forEach(([symbol, fn]) => {
    env.set(new MalSymbol(symbol), fn);
  })
}

bindNS();

module.exports = {
  env
};
