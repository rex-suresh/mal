const { isDeepStrictEqual } = require('util');

const { Env } = require('./env');
const { MalList, MalValue, MalNil, MalSymbol, MalString } = require('./types');
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

const val_list = (args) => {
  return args.map(item => {
    if (item instanceof MalString) {
      return item.value;
    }
    return pr_str(item)
  })
}

const printLn = (...args) => {
  console.log(...val_list(args));
  return new MalNil();
}

const prn = (...args) => {
  console.log(...args.map(item => pr_str(item)));
  return new MalNil();
}

const str = (...args) => {
  return new MalString(val_list(args).join(''));
}

const notOf = (arg) => {
  return !(arg && !(arg instanceof MalNil));
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
env.set(new MalSymbol('prn'), prn);
env.set(new MalSymbol('pr-str'), (...args) => args.map(pr_str).join(' '));
env.set(new MalSymbol('str'), str);
env.set(new MalSymbol('println'), printLn);
env.set(new MalSymbol('list'), createList);
env.set(new MalSymbol('list?'), isList);
env.set(new MalSymbol('empty?'), isEmpty);
env.set(new MalSymbol('not'), notOf);


module.exports = {
  env
};
