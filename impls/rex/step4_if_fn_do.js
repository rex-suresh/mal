
const readline = require('readline');
const { stdin, stdout } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { MalSymbol, MalList, MalNil } = require('./types');
const { MalVector } = require('./types');
const { Env } = require('./env');
const { env } = require('./core');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const fnBlock = (ast, env) => {
  const scopeEnv = new Env(env);

  return (...args) => {
    const bindings = ast.value[1].value;
    for (let i = 0; i < bindings.length; i++) {
      if (bindings[i].value === '&') {
        const name = bindings[i + 1];
        const restArgs = args.slice(i);

        scopeEnv.set(name, new MalList(restArgs));
        i = bindings.length;
      } else {
        scopeEnv.set(bindings[i], EVAL(args[i], env));
      }
    }

    const exp = ast.value[2];
    if (exp || exp === false) {
      return EVAL(exp, scopeEnv);
    }
    return new MalNil();
  };
}

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

const ifBlock = (ast, env) => {
  const condition = EVAL(ast.value[1], env);
  const ifPart = ast.value[2];
  const elsePart = ast.value[3];

  if (condition && !(condition instanceof MalNil)) {
    return EVAL(ifPart, env);
  }

  if (!elsePart && elsePart !== false) {
    return new MalNil();
  }
  return EVAL(elsePart, env);
}

const doBlock = (ast, env) => {
  const exps = ast.value.slice(1);
  const results = exps.map(item => EVAL(item, env));

  if (results.length === 0) {
    return new MalNil();
  }
  return results[results.length - 1];
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
    case 'if': return ifBlock(ast, env);
    case 'do': return doBlock(ast, env);
    case 'fn*': return fnBlock(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (malValue) => pr_str(malValue);
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
// (def! fact (fn* [x] (if (< x 1) 1 (* x (fact (- x 1))))))