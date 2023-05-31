
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

  if (EVAL(cond, env)) {
    return EVAL(ifPart, env);
  }

  if (elsePart) {
    return EVAL(elsePart, env);
  }
}

const createList = (ast, env) => {
  const listItems = ast.value.slice(1, ast.value.length);
  const value = listItems.map(item => EVAL(item, env));

  return new MalList(value);
}

const doBlock = (ast, env) => {
  const listItems = ast.value.slice(1, ast.value.length);
  listItems.forEach(item => EVAL(item, env));
  return new MalNil(value);
}

const isList = (ast) => {
  return ast.value[1] instanceof MalList;
}

const isEmpty = (ast, env) => {
  const param = EVAL(ast.value[1], env);
  return param.value.length === 0;
}

const countOf = (ast, env) => {
  const list = ast.value[1];
  if (list instanceof MalNil) {
    return new MalValue(0);
  }

  return new MalValue(EVAL(list, env).count());
}

const greaterThan = (ast, env) => {
  return true;
}

const lessThan = (ast, env) => {
  return true;
}

const equals = (ast, env) => {
  return true;
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
    case 'list': return createList(ast, env);
    case 'list?': return isList(ast);
    case 'empty?': return isEmpty(ast, env);
    case 'count': return countOf(ast, env);
    case '>': return greaterThan(ast, env);
    case '<': return lessThan(ast, env);
    case '=': return equals(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (malValue) => pr_str(malValue);

const env = new Env(null);
env.set(new MalSymbol('+'), (...args) => (args.reduce(add)))
env.set(new MalSymbol('-'), (...args) => (args.reduce(sub)))
env.set(new MalSymbol('*'), (...args) => (args.reduce(mul)))
env.set(new MalSymbol('/'), (...args) => (args.reduce(div)))

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
