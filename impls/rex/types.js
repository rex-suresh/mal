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

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '(' + this.value.map(x => x.pr_str()).join(' ') + ')';
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }
}

class MalObject extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '{' + this.value.map(x => x.pr_str()).join(' ') + '}';
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(x => x.pr_str()).join(' ') + ']';
  }

  count() {
    return this.value.length;
  }
}

class MalString extends MalValue {
  static escapeSeq =
    ["\a", "\b", "\e", "\f", "\n", "\r", "\t", "\v", "\\", "\'", "\nnn", "\cx"]
  constructor(value) {
    super(value);
  }

  pr_str(readably) {
    if (readably) {
      const quoteEscaped =
        this.value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\\"');
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
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  pr_str() {
    return '#<function>';
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
  MalFunction
};