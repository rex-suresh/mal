
const readline = require('readline');
const { stdin, stdout, argv } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { MalSymbol, MalList, MalNil, MalFunction, createMalString } = require('./types');
const { MalVector } = require('./types');
const { Env } = require('./env');
const { env } = require('./core');

const processArgs =
  new MalList(argv
    .slice(2)
    .map(
      (arg) =>
        createMalString(arg.slice(1, -1))));

env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
env.set(new MalSymbol('*ARGV*'), processArgs);

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const fnBlock = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol('do'), ...body]);

  const fn = (...args) => {
    const scopedEnv = new Env(env, binds.value, args);
    return EVAL(doForms, scopedEnv);
  }

  return new MalFunction(doForms, binds, env, fn);
}

const bindDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
}

const bindLet = (ast, env) => {
  const [{ value }, ...forms] = ast.value.slice(1);
  const scopeEnv = new Env(env);

  for (let i = 0; i < value.length; i = i + 2) {
    scopeEnv.set(value[i], EVAL(value[i + 1], scopeEnv));
  }

  const doForms = new MalList([new MalSymbol('do'), ...forms]);
  return [doForms, scopeEnv];
}

const ifBlock = (ast, env) => {
  const condition = EVAL(ast.value[1], env);
  const ifPart = ast.value[2];
  const elsePart = ast.value[3] ?? new MalNil();

  return condition && !(condition instanceof MalNil) ? ifPart : elsePart;
}

const doBlock = (ast, env) => {
  const exps = ast.value.slice(1);
  exps.slice(0, -1).forEach(item => EVAL(item, env));
  return exps[exps.length - 1];
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
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }
    if (ast.isEmpty()) {
      return ast;
    }

    switch (ast.value[0].value) {
      case 'def!': return bindDef(ast, env);
      case 'let*':
        [ast, env] = bindLet(ast, env);
        break;
      case 'if':
        ast = ifBlock(ast, env);
        break;
      case 'do':
        ast = doBlock(ast, env);
        break;
      case 'fn*':
        ast = fnBlock(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          ast = fn.value;
          env = new Env(fn.env, fn.binds.value, args);
        } else {
          return fn.apply(null, args);
        }
    }

  }
};

const PRINT = (malValue) => pr_str(malValue);
const rep = (str) => PRINT(EVAL(READ(str), env));

rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

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

if (argv.length >= 3) {
  rep(`(load-file "${argv[2]}")`)
  rl.close();
} else {
  repl();
}
