const { MalList, MalSymbol, MalValue, MalVector, MalObject, MalNil, MalString }
  = require('./types');

const reg_exp = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g

const tokenize = (str) =>
  [...str.matchAll(reg_exp)]
    .map(match => match[1])
    .slice(0, -1);

const read_seq = (reader, closingSymbol) => {
  const ast = [];

  while (reader.peek() != closingSymbol) {
    if (reader.peek() === undefined) {
      throw 'unbalanced';
    }

    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
}

const read_list = (reader) => {
  const ast = read_seq(reader, ')');
  return new MalList(ast);
}

const read_vector = (reader) => {
  const ast = read_seq(reader, ']');
  return new MalVector(ast);
}

const read_object = (reader) => {
  const ast = read_seq(reader, '}');
  return new MalObject(ast);
}

const read_string = (reader) => {
  const ast = read_seq(reader, '"');
  return new MalString(ast);
}

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return new MalValue(parseInt(token));
  }

  if (['true', 'false'].includes(token)) {
    return token === 'true';
  }

  if (token === 'nil') {
    return new MalNil();
  }

  return new MalSymbol(token);
}

const read_form = (reader) => {
  const token = reader.peek();

  switch (token) {
    case '(':
      reader.next();
      return read_list(reader);
    case '[':
      reader.next();
      return read_vector(reader);
    case '{':
      reader.next();
      return read_object(reader);
    case '"':
      reader.next();
      return read_string(reader);
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