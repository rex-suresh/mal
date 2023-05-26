const readline = require('readline');
const { stdin, stdout } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const READ = () =>
  new Promise((resolve) => {
    rl.question('rex> ', (input) => resolve(read_str(input)));
  })

const EVAL = (string) => string;

const PRINT = (malValue) =>
  console.log(pr_str(malValue));

const repl = () => {
  READ()
    .then(EVAL)
    .then(PRINT)
    .then(repl)
}

repl();
