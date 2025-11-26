const TokenType = {
  // Keywords
  INT: 'INT',
  CHAR: 'CHAR',
  VOID: 'VOID',
  IF: 'IF',
  ELSE: 'ELSE',
  FOR: 'FOR',
  WHILE: 'WHILE',
  DO: 'DO',
  RETURN: 'RETURN',
  PRINTF: 'PRINTF',
  SCANF: 'SCANF',
  
  // Identifiers and literals
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  CHAR_LITERAL: 'CHAR_LITERAL',
  STRING_LITERAL: 'STRING_LITERAL',
  
  // Operators
  ASSIGN: 'ASSIGN',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  MODULO: 'MODULO',
  
  // Comparison
  EQ: 'EQ',
  NE: 'NE',
  LT: 'LT',
  GT: 'GT',
  LE: 'LE',
  GE: 'GE',
  
  // Logical
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  
  // Bitwise
  BIT_AND: 'BIT_AND',
  BIT_OR: 'BIT_OR',
  BIT_XOR: 'BIT_XOR',
  LEFT_SHIFT: 'LEFT_SHIFT',
  RIGHT_SHIFT: 'RIGHT_SHIFT',
  
  // Compound assignment
  PLUS_ASSIGN: 'PLUS_ASSIGN',
  MINUS_ASSIGN: 'MINUS_ASSIGN',
  
  // Increment/Decrement
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  
  // Punctuation
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  
  // Special
  EOF: 'EOF'
};

/**
 * Token class
 */
class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
  
  toString() {
    return `Token(${this.type}, '${this.value}', ${this.line}:${this.column})`;
  }
}

/**
 * Tokenizer (Lexical Analyzer)
 */
class Tokenizer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.currentChar = input[0];
    
    // Keywords map
    this.keywords = {
      'int': TokenType.INT,
      'char': TokenType.CHAR,
      'void': TokenType.VOID,
      'if': TokenType.IF,
      'else': TokenType.ELSE,
      'for': TokenType.FOR,
      'while': TokenType.WHILE,
      'do': TokenType.DO,
      'return': TokenType.RETURN,
      'printf': TokenType.PRINTF,
      'scanf': TokenType.SCANF
    };
  }
  
  /**
   * Advance position and update current character
   */
  advance() {
    if (this.currentChar === '\n') {
      this.line++;
      this.column = 0;
    }
    
    this.position++;
    this.column++;
    
    if (this.position >= this.input.length) {
      this.currentChar = null;
    } else {
      this.currentChar = this.input[this.position];
    }
  }
  
  /**
   * Peek at next character without advancing
   */
  peek(offset = 1) {
    const peekPos = this.position + offset;
    if (peekPos >= this.input.length) {
      return null;
    }
    return this.input[peekPos];
  }
  
  /**
   * Skip whitespace
   */
  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }
  
  /**
 * Skip comments - supports:
 *   // single-line comments
 *   /* multi-line comments *\/
 */
skipComment() {
  if (this.currentChar === '/' && this.peek() === '/') {
    // Single-line comment
    while (this.currentChar && this.currentChar !== '\n') {
      this.advance();
    }
    this.advance(); // Skip newline
  } else if (this.currentChar === '/' && this.peek() === '*') {
    // Multi-line comment
    this.advance(); // Skip /
    this.advance(); // Skip *
    
    while (this.currentChar) {
      if (this.currentChar === '*' && this.peek() === '/') {
        this.advance(); // Skip *
        this.advance(); // Skip /
        break;
      }
      this.advance();
    }
  }
}

  /**
   * Read identifier or keyword
   */
  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;
    let result = '';
    
    while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    // Check if it's a keyword
    const tokenType = this.keywords[result] || TokenType.IDENTIFIER;
    
    return new Token(tokenType, result, startLine, startColumn);
  }
  
  /**
   * Read number (integer or hex)
   */
  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;
    let result = '';
    
    // Check for hex number (0x...)
    if (this.currentChar === '0' && this.peek() === 'x') {
      result += this.currentChar;
      this.advance();
      result += this.currentChar;
      this.advance();
      
      while (this.currentChar && /[0-9a-fA-F]/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
    } else {
      // Decimal number
      while (this.currentChar && /[0-9]/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
    }
    
    return new Token(TokenType.NUMBER, result, startLine, startColumn);
  }
  
  /**
   * Read character literal ('a', '\n', etc.)
   */
  readCharLiteral() {
    const startLine = this.line;
    const startColumn = this.column;
    
    this.advance(); // Skip opening '
    
    let char = '';
    if (this.currentChar === '\\') {
      // Escape sequence
      this.advance();
      char = '\\' + this.currentChar;
      this.advance();
    } else {
      char = this.currentChar;
      this.advance();
    }
    
    if (this.currentChar !== "'") {
      throw new Error(`Unterminated character literal at line ${startLine}:${startColumn}`);
    }
    this.advance(); // Skip closing '
    
    return new Token(TokenType.CHAR_LITERAL, char, startLine, startColumn);
  }
  
  /**
   * Read string literal ("hello world")
   */
  readStringLiteral() {
    const startLine = this.line;
    const startColumn = this.column;
    
    this.advance(); // Skip opening "
    
    let str = '';
    while (this.currentChar && this.currentChar !== '"') {
      if (this.currentChar === '\\') {
        str += this.currentChar;
        this.advance();
        if (this.currentChar) {
          str += this.currentChar;
          this.advance();
        }
      } else {
        str += this.currentChar;
        this.advance();
      }
    }
    
    if (this.currentChar !== '"') {
      throw new Error(`Unterminated string literal at line ${startLine}:${startColumn}`);
    }
    this.advance(); // Skip closing "
    
    return new Token(TokenType.STRING_LITERAL, str, startLine, startColumn);
  }
  
  /**
   * Get next token
   */
  getNextToken() {
    while (this.currentChar) {
      const startLine = this.line;
      const startColumn = this.column;
      
      // Skip whitespace
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }
      
      // Skip comments
      if (this.currentChar === '/' && (this.peek() === '/' || this.peek() === '*')) {
        this.skipComment();
        continue;
      }
      
      // Identifier or keyword
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.readIdentifier();
      }
      
      // Number
      if (/[0-9]/.test(this.currentChar)) {
        return this.readNumber();
      }
      
      // Character literal
      if (this.currentChar === "'") {
        return this.readCharLiteral();
      }
      
      // String literal
      if (this.currentChar === '"') {
        return this.readStringLiteral();
      }
      
      // Two-character operators
      if (this.currentChar === '=' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(TokenType.EQ, '==', startLine, startColumn);
      }
      
      if (this.currentChar === '!' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(TokenType.NE, '!=', startLine, startColumn);
      }
      
      if (this.currentChar === '<' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(TokenType.LE, '<=', startLine, startColumn);
      }
      
      if (this.currentChar === '>' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(TokenType.GE, '>=', startLine, startColumn);
      }
      
      if (this.currentChar === '<' && this.peek() === '<') {
        this.advance();
        this.advance();
        return new Token(TokenType.LEFT_SHIFT, '<<', startLine, startColumn);
      }
      
      if (this.currentChar === '>' && this.peek() === '>') {
        this.advance();
        this.advance();
        return new Token(TokenType.RIGHT_SHIFT, '>>', startLine, startColumn);
      }
      
      if (this.currentChar === '&' && this.peek() === '&') {
        this.advance();
        this.advance();
        return new Token(TokenType.AND, '&&', startLine, startColumn);
      }
      
      if (this.currentChar === '|' && this.peek() === '|') {
        this.advance();
        this.advance();
        return new Token(TokenType.OR, '||', startLine, startColumn);
      }
      
      if (this.currentChar === '+' && this.peek() === '+') {
        this.advance();
        this.advance();
        return new Token(TokenType.INCREMENT, '++', startLine, startColumn);
      }
      
      if (this.currentChar === '-' && this.peek() === '-') {
        this.advance();
        this.advance();
        return new Token(TokenType.DECREMENT, '--', startLine, startColumn);
      }
      
      if (this.currentChar === '+' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(TokenType.PLUS_ASSIGN, '+=', startLine, startColumn);
      }
      
      if (this.currentChar === '-' && this.peek() === '=') {
        this.advance();
        this.advance();
        return new Token(TokenType.MINUS_ASSIGN, '-=', startLine, startColumn);
      }
      
      // Single-character operators and punctuation
      const char = this.currentChar;
      this.advance();
      
      switch (char) {
        case '=': return new Token(TokenType.ASSIGN, '=', startLine, startColumn);
        case '+': return new Token(TokenType.PLUS, '+', startLine, startColumn);
        case '-': return new Token(TokenType.MINUS, '-', startLine, startColumn);
        case '*': return new Token(TokenType.MULTIPLY, '*', startLine, startColumn);
        case '/': return new Token(TokenType.DIVIDE, '/', startLine, startColumn);
        case '%': return new Token(TokenType.MODULO, '%', startLine, startColumn);
        case '<': return new Token(TokenType.LT, '<', startLine, startColumn);
        case '>': return new Token(TokenType.GT, '>', startLine, startColumn);
        case '!': return new Token(TokenType.NOT, '!', startLine, startColumn);
        case '&': return new Token(TokenType.BIT_AND, '&', startLine, startColumn);
        case '|': return new Token(TokenType.BIT_OR, '|', startLine, startColumn);
        case '^': return new Token(TokenType.BIT_XOR, '^', startLine, startColumn);
        case ';': return new Token(TokenType.SEMICOLON, ';', startLine, startColumn);
        case ',': return new Token(TokenType.COMMA, ',', startLine, startColumn);
        case '(': return new Token(TokenType.LPAREN, '(', startLine, startColumn);
        case ')': return new Token(TokenType.RPAREN, ')', startLine, startColumn);
        case '{': return new Token(TokenType.LBRACE, '{', startLine, startColumn);
        case '}': return new Token(TokenType.RBRACE, '}', startLine, startColumn);
        case '[': return new Token(TokenType.LBRACKET, '[', startLine, startColumn);
        case ']': return new Token(TokenType.RBRACKET, ']', startLine, startColumn);
        default:
          throw new Error(`Unexpected character '${char}' at line ${startLine}:${startColumn}`);
      }
    }
    
    return new Token(TokenType.EOF, '', this.line, this.column);
  }
  
  /**
   * Tokenize entire input
   */
  tokenize() {
    const tokens = [];
    let token = this.getNextToken();
    
    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.getNextToken();
    }
    
    tokens.push(token); // Add EOF token
    return tokens;
  }
}

module.exports = { Tokenizer, Token, TokenType };