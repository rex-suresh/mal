const reg_exp = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g

const tokenize = (str) =>
  [...str.matchAll(reg_exp)].map(match => match[1]);

const read_list = (reader) => {
  const ast = [];

  while (reader.peek() != ')') {
    ast.push(read_form(reader));
  }

  reader.next(); // Mutation
  return ast;
}

const read_atom = (reader) => {
  const token = reader.next(); // Mutation

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }

  return token;
}

const read_form = (reader) => {
  const token = reader.peek();

  switch (token) {
    case '(':
      reader.next(); // Mutation
      return read_list(reader);
    default:
      return read_atom(reader);
  }
}

const read_str = (str) => {
  const tokens = tokenize(str)
  const reader = new Reader(tokens);

  return read_form(reader);
}

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    this.position++;
    return token;
  }
}

module.exports = { read_str, Reader }