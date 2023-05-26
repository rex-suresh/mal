const readline = require('readline');
const { stdin, stdout } = require('node:process');
const rl = readline.createInterface({ input: stdin, output: stdin });

stdin.setEncoding('utf8');
stdout.setEncoding('utf8');

const READ = () => {
  return new Promise((resolve) => {
    rl.question('rex> ', (input) => resolve(input));
  })
}
const EVAL = (string) => string;
const PRINT = (result) => {
  console.log(result)
};

const repl = () => {
  READ()
    .then(EVAL)
    .then(PRINT)
    .then(repl)
}

repl();
