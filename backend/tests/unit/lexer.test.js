// backend/tests/unit/lexer.test.js

const { Lexer, TokenType } = require('../../src/compiler/lexer/tokenizer');

describe('Lexer - Tokenization Tests', () => {
  
  // Test 1: Keywords
  test('should tokenize keywords correctly', () => {
    const code = 'int char if else for while do return';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.INT);
    expect(tokens[1].type).toBe(TokenType.CHAR);
    expect(tokens[2].type).toBe(TokenType.IF);
    expect(tokens[3].type).toBe(TokenType.ELSE);
    expect(tokens[4].type).toBe(TokenType.FOR);
    expect(tokens[5].type).toBe(TokenType.WHILE);
    expect(tokens[6].type).toBe(TokenType.DO);
    expect(tokens[7].type).toBe(TokenType.RETURN);
  });
  
  // Test 2: Identifiers
  test('should tokenize identifiers', () => {
    const code = 'x count_value _temp var123';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].value).toBe('x');
    expect(tokens[1].value).toBe('count_value');
    expect(tokens[2].value).toBe('_temp');
    expect(tokens[3].value).toBe('var123');
  });
  
  // Test 3: Numbers
  test('should tokenize decimal and hexadecimal numbers', () => {
    const code = '42 0 123 0xFF 0x1A';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('42');
    expect(tokens[3].value).toBe('0xFF');
  });
  
  // Test 4: Operators
  test('should tokenize arithmetic operators', () => {
    const code = '+ - * / %';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.PLUS);
    expect(tokens[1].type).toBe(TokenType.MINUS);
    expect(tokens[2].type).toBe(TokenType.MULTIPLY);
    expect(tokens[3].type).toBe(TokenType.DIVIDE);
    expect(tokens[4].type).toBe(TokenType.MODULO);
  });
  
  // Test 5: Relational operators
  test('should tokenize relational operators', () => {
    const code = '== != < > <= >=';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.EQ);
    expect(tokens[1].type).toBe(TokenType.NE);
    expect(tokens[2].type).toBe(TokenType.LT);
    expect(tokens[3].type).toBe(TokenType.GT);
    expect(tokens[4].type).toBe(TokenType.LE);
    expect(tokens[5].type).toBe(TokenType.GE);
  });
  
  // Test 6: Logical operators
  test('should tokenize logical operators', () => {
    const code = '&& || !';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.AND);
    expect(tokens[1].type).toBe(TokenType.OR);
    expect(tokens[2].type).toBe(TokenType.NOT);
  });
  
  // Test 7: Assignment operators
  test('should tokenize assignment operators', () => {
    const code = '= += -=';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.ASSIGN);
    expect(tokens[1].type).toBe(TokenType.PLUS_ASSIGN);
    expect(tokens[2].type).toBe(TokenType.MINUS_ASSIGN);
  });
  
  // Test 8: Increment/Decrement
  test('should tokenize increment and decrement', () => {
    const code = '++ --';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.INCREMENT);
    expect(tokens[1].type).toBe(TokenType.DECREMENT);
  });
  
  // Test 9: Delimiters
  test('should tokenize delimiters', () => {
    const code = '; , ( ) { } [ ]';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.SEMICOLON);
    expect(tokens[1].type).toBe(TokenType.COMMA);
    expect(tokens[2].type).toBe(TokenType.LPAREN);
    expect(tokens[3].type).toBe(TokenType.RPAREN);
    expect(tokens[4].type).toBe(TokenType.LBRACE);
    expect(tokens[5].type).toBe(TokenType.RBRACE);
    expect(tokens[6].type).toBe(TokenType.LBRACKET);
    expect(tokens[7].type).toBe(TokenType.RBRACKET);
  });
  
  // Test 10: Character literals
  test('should tokenize character literals', () => {
    const code = "'a' '\\n' '\\t'";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.CHAR_LITERAL);
    expect(tokens[0].value).toBe('a');
    expect(tokens[1].value).toBe('\\n');
  });
  
  // Test 11: String literals
  test('should tokenize string literals', () => {
    const code = '"hello" "world\\n"';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.STRING_LITERAL);
    expect(tokens[0].value).toBe('hello');
    expect(tokens[1].value).toBe('world\\n');
  });
  
  // Test 12: Comments
  test('should skip single-line comments', () => {
    const code = 'int x; // This is a comment\nint y;';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.INT);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].type).toBe(TokenType.SEMICOLON);
    expect(tokens[3].type).toBe(TokenType.INT);
    expect(tokens[4].value).toBe('y');
  });
  
  // Test 13: Multi-line comments
  test('should skip multi-line comments', () => {
    const code = 'int x; /* comment\nacross lines */ int y;';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.INT);
    expect(tokens[3].type).toBe(TokenType.INT);
    expect(tokens[4].value).toBe('y');
  });
  
  // Test 14: Complete C statement
  test('should tokenize complete C statement', () => {
    const code = 'int x = 5;';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.INT);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe('x');
    expect(tokens[2].type).toBe(TokenType.ASSIGN);
    expect(tokens[3].type).toBe(TokenType.NUMBER);
    expect(tokens[3].value).toBe('5');
    expect(tokens[4].type).toBe(TokenType.SEMICOLON);
  });
  
  // Test 15: Line and column tracking
  test('should track line and column numbers', () => {
    const code = 'int x;\nint y;';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].line).toBe(1);
    expect(tokens[0].column).toBe(1);
    expect(tokens[3].line).toBe(2); // 'int' on second line
  });
  
  // Test 16: Error handling
  test('should detect unknown characters', () => {
    const code = 'int x @ 5;';
    const lexer = new Lexer(code);
    
    expect(() => lexer.getTokens()).toThrow('Lexical errors');
  });
  
  // Test 17: Empty input
  test('should handle empty input', () => {
    const code = '';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
  });
  
  // Test 18: Whitespace handling
  test('should skip all types of whitespace', () => {
    const code = '  int\t\tx\n\n=\r\n5  ;  ';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.INT);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].type).toBe(TokenType.ASSIGN);
    expect(tokens[3].type).toBe(TokenType.NUMBER);
  });
  
  // Test 19: Complex expression
  test('should tokenize complex expression', () => {
    const code = 'sum = arr[i] + count * 2;';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    const expectedTypes = [
      TokenType.IDENTIFIER, // sum
      TokenType.ASSIGN,     // =
      TokenType.IDENTIFIER, // arr
      TokenType.LBRACKET,   // [
      TokenType.IDENTIFIER, // i
      TokenType.RBRACKET,   // ]
      TokenType.PLUS,       // +
      TokenType.IDENTIFIER, // count
      TokenType.MULTIPLY,   // *
      TokenType.NUMBER,     // 2
      TokenType.SEMICOLON   // ;
    ];
    
    expectedTypes.forEach((expectedType, index) => {
      expect(tokens[index].type).toBe(expectedType);
    });
  });
  
  // Test 20: Bitwise operators
  test('should tokenize bitwise operators', () => {
    const code = '& | ^ << >>';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.BIT_AND);
    expect(tokens[1].type).toBe(TokenType.BIT_OR);
    expect(tokens[2].type).toBe(TokenType.BIT_XOR);
    expect(tokens[3].type).toBe(TokenType.LEFT_SHIFT);
    expect(tokens[4].type).toBe(TokenType.RIGHT_SHIFT);
  });
});