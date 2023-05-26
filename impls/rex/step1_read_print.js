const readline = require('readline');
const { stdin, stdout } = require('node:process');
const rl = readline.createInterface({ input: stdin, output: stdin });

stdin.setEncoding('utf8');
stdout.setEncoding('utf8');

const readInput = () => {
  return new Promise((resolve) => {
    rl.question('user> ', (input) => resolve(input));
  })
}
const evalInput = (string) => string;
const print = (result) => {
  console.log(result)
};

const repl = () => {
  readInput()
    .then(evalInput)
    .then(print)
    .then(repl)
}

repl();
