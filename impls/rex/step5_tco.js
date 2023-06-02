
const readline = require('readline');
const { stdin, stdout } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { MalSymbol, MalList, MalNil, MalFunction } = require('./types');
const { MalVector } = require('./types');
const { Env } = require('./env');
const { env } = require('./core');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const fnBlock = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol('do'), ...body]);

  return new MalFunction(doForms, binds, env);
}

const bindDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
}

const bindLet = (ast, env) => {
  const [bindings, ...forms] = ast.value.slice(1);
  const scopeEnv = new Env(env);

  for (let i = 0; i < bindings.value.length; i = i + 2) {
    scopeEnv.set(bindings.value[i], EVAL(bindings.value[i + 1], scopeEnv));
  }

  const doForms = new MalList([new MalSymbol('do'), ...forms]);
  return [doForms, scopeEnv];
}

const ifBlock = (ast, env) => {
  const condition = EVAL(ast.value[1], env);
  const ifPart = ast.value[2];
  const elsePart = ast.value[3];

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
          const oldEnv = fn.env;
          const binds = fn.binds;

          env = new Env(oldEnv, binds.value, args);
        } else {
          return fn.apply(null, args);
        }
    }

  }
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