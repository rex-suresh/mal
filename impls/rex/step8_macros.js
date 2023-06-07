const readline = require('readline');
const { stdin, stdout, argv } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { MalSymbol, MalList,
  MalNil, MalFunction, createMalString, MalSeq } = require('./types');
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

const handleDefMacro = (ast, env) => {
  const macro = EVAL(ast.value[2], env);
  macro.isMacro = true;
  env.set(ast.value[1], macro);
  return env.get(ast.value[1]);
}

const isMacroCall = (ast, env) => {
  try {
    return ((ast instanceof MalList) &&
      !ast.isEmpty() &&
      ast.value[0] instanceof MalSymbol &&
      env.get(ast.value[0]).isMacro);
  } catch (error) {
    return false;
  }
}

const macroExpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const macro = env.get(ast.value[0]);
    ast = macro.apply(null, ast.value.slice(1));
  }

  return ast;
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

const quasiQuote = (ast) => {
  if (ast instanceof MalList && ast.beginsWith('unquote')) {
    return ast.value[1];
  }

  if (ast instanceof MalSeq) {
    let result = new MalList([]);
    for (let index = ast.value.length - 1; index >= 0; index--) {
      const element = ast.value[index];

      if ((element instanceof MalList)
        && element.beginsWith('splice-unquote')) {
        result =
          new MalList([new MalSymbol('concat'), element.value[1], result])
      } else {
        result =
          new MalList([new MalSymbol('cons'), quasiQuote(element), result])
      }
    }

    if (ast instanceof MalVector) {
      return new MalList([new MalSymbol('vec'), result]);
    }

    return result;
  }

  if (ast instanceof MalSymbol) {
    return new MalList([new MalSymbol('quote'), ast]);
  }

  return ast;
};

const READ = (input) => read_str(input);

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }
    if (ast.isEmpty()) {
      return ast;
    }

    ast = macroExpand(ast, env);

    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }
    switch (ast.value[0].value) {
      case 'def!': return bindDef(ast, env);
      case 'defmacro!': return handleDefMacro(ast, env);
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
      case 'unquote':
        ast = ast.value[1];
        break;
      case 'quasiquoteexpand':
        return quasiQuote(ast.value[1]);
      case 'macroexpand':
        return macroExpand(ast.value[1], env);
      case 'quote':
        return ast.value[1];
      case 'quasiquote':
        ast = quasiQuote(ast.value[1]);
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
rep("(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw \"odd number of forms to cond\")) (cons 'cond (rest (rest xs)))))))");

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
