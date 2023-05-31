
const readline = require('readline');
const { stdin, stdout } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { MalSymbol, MalList, MalValue, MalObject, MalNil } = require('./types');
const { MalVector } = require('./types');
const { Env } = require('./env');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const add = (a, b) => new MalValue(a.value + b.value);
const sub = (a, b) => new MalValue(a.value - b.value);
const mul = (a, b) => new MalValue(a.value * b.value);
const div = (a, b) => new MalValue(a.value / b.value);

const equals = (a, b) => a === b;
const greaterThan = (a, b) => a > b;
const lessThan = (a, b) => a < b;
const lessThanEqual = (a, b) => a <= b;
const greaterThanEqual = (a, b) => a >= b;

const bindDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
}

const bindLet = (ast, env) => {
  const scopeEnv = new Env(env);
  const bindings = ast.value[1].value;

  for (let i = 0; i < bindings.length; i = i + 2) {
    scopeEnv.set(bindings[i], EVAL(bindings[i + 1], scopeEnv));
  }

  const exp = ast.value[2];
  if (exp) {
    return EVAL(exp, scopeEnv);
  }

  return new MalNil();
}

const ifFn = (ast, env) => {
  const cond = ast.value[1].value;
  const ifPart = ast.value[2].value;
  const elsePart = ast.value[3].value;
  const condition = EVAL(cond, env);

  if (condition && !(condition instanceof MalNil)) {
    return EVAL(ifPart, env);
  }

  if (elsePart) {
    return EVAL(elsePart, env);
  }
}

const createList = (...args) => {
  return new MalList(args);
}

const doBlock = (ast, env) => {
  const listItems = ast.value.slice(1);
  listItems.forEach(item => EVAL(item, env));
  return new MalNil(value); // returns last eval val
}

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
    const RHS = args[i - 1].value;
    const LHS = args[i].value;

    if (!(pred(RHS, LHS))) {
      return false;
    }
  }

  return true;
}


const printAst = (args) => {
  const list = args.map(item => EVAL(item, env)?.value || EVAL(item, env));

  console.log(...list);
  return new MalNil();
}

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalList) {
    const newAST = ast.value.map(x => EVAL(x, env));
    return new MalList(newAST);
  }

  if (ast instanceof MalVector) {
    const newAST = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAST);
  }

  return ast;
}

const READ = (input) => read_str(input);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.value[0].value) {
    case 'def!': return bindDef(ast, env);
    case 'let*': return bindLet(ast, env);
    case 'if': return ifFn(ast, env);
    case 'do': return doBlock(ast, env);
    // case 'empty?': return isEmpty(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (malValue) => pr_str(malValue);

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
env.set(new MalSymbol('print'), printAst);
env.set(new MalSymbol('list'), createList);
env.set(new MalSymbol('list?'), isList);
env.set(new MalSymbol('empty?'), isEmpty);

const rep = (str) => PRINT(EVAL(READ(str), env));

const repl = () => {
  rl.question('rex=> ', (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });
}

repl();
