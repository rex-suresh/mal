const readline = require('readline');
const { stdin, stdout } = require('process');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const READ = (input) => read_str(input);
const EVAL = (string) => string;
const PRINT = (malValue) => console.log(pr_str(malValue));
const rep = (str) => PRINT(EVAL(READ(str)));

const repl = () => {
  rl.question('rex> ', (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });
}

repl();
