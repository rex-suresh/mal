const { MalValue } = require("./types");

const pr_str = (malValue, readably = false) => {
  if (malValue instanceof MalValue) {
    return malValue.pr_str(readably);
  }

  return malValue.toString();
};

module.exports = { pr_str }