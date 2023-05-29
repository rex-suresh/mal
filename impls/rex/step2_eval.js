const readline = require('readline');
const { stdin, stdout } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { MalSymbol, MalList, MalValue } = require('./types');
const { MalVector } = require('./types');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const repl_env = {
  '+': (...args) => (args.reduce((a, b) => new MalValue(a.value + b.value))),
  '*': (...args) => (args.reduce((a, b) => new MalValue(a.value * b.value))),
  '-': (...args) => (args.reduce((a, b) => new MalValue(a.value - b.value))),
  '/': (...args) => (args.reduce((a, b) => new MalValue(a.value / b.value))),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value];
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

  const [fn, ...args] = eval_ast(ast, env).value;

  return fn.apply(null, args);
  // return args.reduce(fn);
};
const PRINT = (malValue) => pr_str(malValue);
const rep = (str) => PRINT(EVAL(READ(str), repl_env));

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
