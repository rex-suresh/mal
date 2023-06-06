const pr_str = (malValue, readably = true) => {
  if (malValue instanceof Function) {
    return "#<function>";
  }

  if (malValue instanceof MalValue) {
    return malValue.pr_str(readably);
  }

  return malValue.toString();
};

const createMalString = (str) => {
  const val = str.replace(/\\(.)/g,
    (_, captured) => captured === 'n' ? '\n' : captured)

  return new MalString(val);
}

class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalSeq extends MalValue {
  constructor(value) {
    super(value);
  }

  beginsWith(begins) {
    return this.value[0]?.value === begins;
  }
}

class MalList extends MalSeq {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '(' + this.value.map(x => pr_str(x)).join(' ') + ')';
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }

  beginsWith(begins) {
    return this.value[0]?.value === begins;
  }
}

class MalObject extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '{' + this.value.map(x => pr_str(x)).join(' ') + '}';
  }
}

class MalVector extends MalSeq {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(x => pr_str(x)).join(' ') + ']';
  }

  count() {
    return this.value.length;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(readably) {
    if (readably) {
      const quoteEscaped =
        this.value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n");
      return '"' + quoteEscaped + '"';
    }

    return this.value;
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return this.value;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }

  pr_str() {
    return '#<function>';
  }

  apply(_, args) {
    return this.fn.apply(null, args);
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably) {
    return `(atom ${pr_str(this.value, print_readably)})`
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return this.value;
  }

  swap(fn, args) {
    this.value = fn.apply(null, [this.value, ...args]);
    return this.value;
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  pr_str() {
    return 'nil';
  }
}

module.exports = {
  MalValue, MalList,
  MalValue, MalSymbol,
  MalVector, MalObject,
  MalNil, MalString,
  MalString, MalKeyword,
  MalAtom, MalSeq,
  MalFunction, createMalString,
  pr_str
};