const { TokenType } = require('../lexer/tokenizer');
const {
  ProgramNode, DeclarationNode, AssignmentNode,
  IfStatementNode, ForLoopNode, WhileLoopNode, DoWhileLoopNode,
  PrintfNode, ScanfNode, BinaryExpressionNode, UnaryExpressionNode,
  IdentifierNode, LiteralNode, ExpressionStatementNode, BlockNode,
  FunctionDeclarationNode, ReturnStatementNode, FunctionCallNode
} = require('./ast_nodes');

/**
 * Recursive Descent Parser for C Subset with Function Support
 */
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = tokens[0];
  }

  /* ---------- basic helpers ---------- */

  peek(offset = 1) {
    const pos = this.position + offset;
    if (pos < 0 || pos >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF
    }
    return this.tokens[pos];
  }

  advance() {
    if (this.position < this.tokens.length - 1) {
      this.position++;
      this.currentToken = this.tokens[this.position];
    }
    return this.currentToken;
  }

  match(...types) {
    return types.includes(this.currentToken.type);
  }

  expect(type, message) {
    if (this.currentToken.type !== type) {
      throw new Error(
        `${message || 'Unexpected token'} at line ${this.currentToken.line}:${this.currentToken.column}. ` +
        `Expected ${type}, got ${this.currentToken.type} ('${this.currentToken.value}')`
      );
    }
    const tok = this.currentToken;
    this.advance();
    return tok;
  }

  isAtEnd() {
    return this.currentToken.type === TokenType.EOF;
  }

  /* ---------- program ---------- */

  /**
   * <program> ::= (<function_declaration> | <global_declaration> | <statement> )*
   */

  parse() {
    const program = new ProgramNode();
if (!program.functions) {
  program.functions = [];
}

    
    // Make sure ProgramNode has .functions in ast_nodes.js:
    // this.functions = [];
    if (!program.functions) program.functions = [];

    while (!this.isAtEnd()) {
      // Function vs global declaration vs statement at top level
      if (this.match(TokenType.INT, TokenType.CHAR, TokenType.VOID)) {
        const next = this.peek(1);
        const next2 = this.peek(2);

        if (next.type === TokenType.IDENTIFIER && next2.type === TokenType.LPAREN) {
          // <type> <identifier> '(' ... => function
          const fn = this.parseFunctionDeclaration();
          program.functions.push(fn);
        } else {
          // Otherwise treat as global variable declaration
          const decl = this.parseDeclaration();
          program.declarations.push(decl);
        }
      } else {
        // Top-level statement (rare, but your old design allows it)
        const stmt = this.parseStatement();
        program.statements.push(stmt);
      }
    }

    return program;
  }

  /* ---------- functions ---------- */

  /**
   * <function> ::= <type> <identifier> '(' <params>? ')' <block>
   */
  parseFunctionDeclaration() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    // Return type
    const returnType = this.currentToken.value; // "int", "char", "void"
    this.advance(); // consume type

    // Name
    const nameTok = this.expect(TokenType.IDENTIFIER, 'Expected function name');
    const functionName = nameTok.value;

    // Params
    this.expect(TokenType.LPAREN, 'Expected ( after function name');

    const params = [];
    if (!this.match(TokenType.RPAREN)) {
      while (true) {
        // param type
        if (!this.match(TokenType.INT, TokenType.CHAR)) {
          throw new Error(`Expected parameter type at line ${this.currentToken.line}:${this.currentToken.column}`);
        }
        const paramType = this.currentToken.value;
        this.advance();

        // param name
        const paramNameTok = this.expect(TokenType.IDENTIFIER, 'Expected parameter name');
        params.push({ type: paramType, name: paramNameTok.value });

        if (!this.match(TokenType.COMMA)) break;
        this.advance(); // skip comma and loop for next param
      }
    }

    this.expect(TokenType.RPAREN, 'Expected ) after parameters');

    // Body
    const bodyBlock = this.parseBlock(); // BlockNode
    const bodyStatements = bodyBlock.statements;

    return new FunctionDeclarationNode(returnType, functionName, params, bodyStatements, line, column);
  }

  /* ---------- declarations ---------- */

  /**
   * <declaration> ::= <type> <identifier> ['[' <number> ']'] ['=' <expression>] ';'
   */
  parseDeclaration() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    const typeTok = this.currentToken;
    const dataType = typeTok.value; // "int" or "char"
    this.advance(); // consume type

    const identTok = this.expect(TokenType.IDENTIFIER, 'Expected identifier after type');
    const identifier = identTok.value;

    let isArray = false;
    let arraySize = null;

    if (this.match(TokenType.LBRACKET)) {
      isArray = true;
      this.advance(); // '['
      if (this.match(TokenType.NUMBER)) {
        arraySize = parseInt(this.currentToken.value);
        this.advance();
      }
      this.expect(TokenType.RBRACKET, 'Expected ] after array size');
    }

    let initialValue = null;
    if (this.match(TokenType.ASSIGN)) {
      this.advance(); // '='
      initialValue = this.parseExpression();
    }

    this.expect(TokenType.SEMICOLON, 'Expected ; after declaration');

    return new DeclarationNode(dataType, identifier, isArray, arraySize, initialValue, line, column);
  }

  /* ---------- statements ---------- */

  parseStatement() {
    // return
    if (this.match(TokenType.RETURN)) {
      return this.parseReturnStatement();
    }

    // block
    if (this.match(TokenType.LBRACE)) {
      return this.parseBlock();
    }

    // if
    if (this.match(TokenType.IF)) {
      return this.parseIfStatement();
    }

    // for
    if (this.match(TokenType.FOR)) {
      return this.parseForLoop();
    }

    // while
    if (this.match(TokenType.WHILE)) {
      return this.parseWhileLoop();
    }

    // do-while
    if (this.match(TokenType.DO)) {
      return this.parseDoWhileLoop();
    }

    // printf
    if (this.match(TokenType.PRINTF)) {
      return this.parsePrintf();
    }

    // scanf
    if (this.match(TokenType.SCANF)) {
      return this.parseScanf();
    }

    // local declarations inside block
    if (this.match(TokenType.INT, TokenType.CHAR)) {
      return this.parseDeclaration();
    }

    // identifier => could be assignment, ++/--, or function call statement
    if (this.match(TokenType.IDENTIFIER)) {
      const next = this.peek(1);
      const line = this.currentToken.line;
      const column = this.currentToken.column;

      if (next.type === TokenType.LPAREN) {
        // function call as statement: foo(...);
        const callExpr = this.parseFunctionCallExpression();
        this.expect(TokenType.SEMICOLON, 'Expected ; after function call');
        return new ExpressionStatementNode(callExpr, line, column);
      } else {
        // assignment / i++ / i-- / a += b ...
        return this.parseAssignmentOrExpression();
      }
    }

    throw new Error(`Unexpected token ${this.currentToken.type} at line ${this.currentToken.line}:${this.currentToken.column}`);
  }

  /* ---------- return ---------- */

  parseReturnStatement() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.RETURN, 'Expected return');

    let expr = null;
    if (!this.match(TokenType.SEMICOLON)) {
      expr = this.parseExpression();
    }

    this.expect(TokenType.SEMICOLON, 'Expected ; after return');

    return new ReturnStatementNode(expr, line, column);
  }

  /* ---------- blocks ---------- */

  parseBlock() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.LBRACE, 'Expected {');

    const statements = [];
    while (!this.match(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.INT, TokenType.CHAR)) {
        statements.push(this.parseDeclaration());
      } else {
        statements.push(this.parseStatement());
      }
    }

    this.expect(TokenType.RBRACE, 'Expected }');

    return new BlockNode(statements, line, column);
  }

  /* ---------- if / loops ---------- */

  parseIfStatement() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.IF, 'Expected if');
    this.expect(TokenType.LPAREN, 'Expected ( after if');

    const condition = this.parseExpression();

    this.expect(TokenType.RPAREN, 'Expected ) after condition');

    let thenBlock = [];
    if (this.match(TokenType.LBRACE)) {
      const block = this.parseBlock();
      thenBlock = block.statements;
    } else {
      thenBlock = [this.parseStatement()];
    }

    let elseBlock = null;
    if (this.match(TokenType.ELSE)) {
      this.advance();
      if (this.match(TokenType.LBRACE)) {
        const block = this.parseBlock();
        elseBlock = block.statements;
      } else {
        elseBlock = [this.parseStatement()];
      }
    }

    return new IfStatementNode(condition, thenBlock, elseBlock, line, column);
  }

  parseForLoop() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.FOR, 'Expected for');
    this.expect(TokenType.LPAREN, 'Expected ( after for');

    // init: either declaration, assignment, or empty
    let init = null;
    if (!this.match(TokenType.SEMICOLON)) {
      if (this.match(TokenType.INT, TokenType.CHAR)) {
        init = this.parseDeclaration(); // consumes semicolon
      } else {
        init = this.parseAssignment();
        this.expect(TokenType.SEMICOLON, 'Expected ; after for init');
      }
    } else {
      this.advance(); // consume ;
    }

    // condition
    let condition = null;
    if (!this.match(TokenType.SEMICOLON)) {
      condition = this.parseExpression();
    }
    this.expect(TokenType.SEMICOLON, 'Expected ; after for condition');

    // update
    let update = null;
    if (!this.match(TokenType.RPAREN)) {
      update = this.parseAssignment();
    }
    this.expect(TokenType.RPAREN, 'Expected ) after for clauses');

    // body
    let body = [];
    if (this.match(TokenType.LBRACE)) {
      const block = this.parseBlock();
      body = block.statements;
    } else {
      body = [this.parseStatement()];
    }

    return new ForLoopNode(init, condition, update, body, line, column);
  }

  parseWhileLoop() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.WHILE, 'Expected while');
    this.expect(TokenType.LPAREN, 'Expected ( after while');

    const condition = this.parseExpression();

    this.expect(TokenType.RPAREN, 'Expected ) after condition');

    let body = [];
    if (this.match(TokenType.LBRACE)) {
      const block = this.parseBlock();
      body = block.statements;
    } else {
      body = [this.parseStatement()];
    }

    return new WhileLoopNode(condition, body, line, column);
  }

  parseDoWhileLoop() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.DO, 'Expected do');

    let body = [];
    if (this.match(TokenType.LBRACE)) {
      const block = this.parseBlock();
      body = block.statements;
    } else {
      body = [this.parseStatement()];
    }

    this.expect(TokenType.WHILE, 'Expected while after do body');
    this.expect(TokenType.LPAREN, 'Expected ( after while');

    const condition = this.parseExpression();

    this.expect(TokenType.RPAREN, 'Expected ) after condition');
    this.expect(TokenType.SEMICOLON, 'Expected ; after do-while');

    return new DoWhileLoopNode(body, condition, line, column);
  }

  /* ---------- printf / scanf ---------- */

  parsePrintf() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.PRINTF, 'Expected printf');
    this.expect(TokenType.LPAREN, 'Expected ( after printf');

    const formatTok = this.expect(TokenType.STRING_LITERAL, 'Expected format string');
    const formatString = formatTok.value;

    const expressions = [];
    while (this.match(TokenType.COMMA)) {
      this.advance();
      expressions.push(this.parseExpression());
    }

    this.expect(TokenType.RPAREN, 'Expected ) after printf arguments');
    this.expect(TokenType.SEMICOLON, 'Expected ; after printf');

    return new PrintfNode(formatString, expressions, line, column);
  }

  parseScanf() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    this.expect(TokenType.SCANF, 'Expected scanf');
    this.expect(TokenType.LPAREN, 'Expected ( after scanf');

    const formatTok = this.expect(TokenType.STRING_LITERAL, 'Expected format string');
    const formatString = formatTok.value;

    const identifiers = [];
    while (this.match(TokenType.COMMA)) {
      this.advance();
      this.expect(TokenType.BIT_AND, 'Expected & before variable in scanf');
      const identTok = this.expect(TokenType.IDENTIFIER, 'Expected identifier');
      identifiers.push(identTok.value);
    }

    this.expect(TokenType.RPAREN, 'Expected ) after scanf arguments');
    this.expect(TokenType.SEMICOLON, 'Expected ; after scanf');

    return new ScanfNode(formatString, identifiers, line, column);
  }

  /* ---------- assignment / expression ---------- */

  /**
   * When we already consumed IDENTIFIER in parseStatement, we use this for a full statement.
   */
  parseAssignmentOrExpression() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;
    const identifier = this.currentToken.value;
    this.advance(); // consume identifier

    let arrayIndex = null;
    if (this.match(TokenType.LBRACKET)) {
      this.advance();
      arrayIndex = this.parseExpression();
      this.expect(TokenType.RBRACKET, 'Expected ] after array index');
    }

    // assignment
    if (this.match(TokenType.ASSIGN, TokenType.PLUS_ASSIGN, TokenType.MINUS_ASSIGN)) {
      const operator = this.currentToken.value;
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.SEMICOLON, 'Expected ; after assignment');
      return new AssignmentNode(identifier, arrayIndex, operator, expr, line, column);
    }

    // ++ / --
    if (this.match(TokenType.INCREMENT, TokenType.DECREMENT)) {
      const operator = this.currentToken.value;
      this.advance();
      this.expect(TokenType.SEMICOLON, 'Expected ; after expression');
      const identNode = new IdentifierNode(identifier, arrayIndex, line, column);
      const expr = new UnaryExpressionNode(operator, identNode, line, column);
      return new ExpressionStatementNode(expr, line, column);
    }

    throw new Error(`Expected assignment or expression at line ${line}:${column}`);
  }

  /**
   * Assignment used in for-loop init/update (no trailing semicolon here).
   */
  parseAssignment() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;
    const identifier = this.currentToken.value;
    this.advance(); // identifier

    let arrayIndex = null;
    if (this.match(TokenType.LBRACKET)) {
      this.advance();
      arrayIndex = this.parseExpression();
      this.expect(TokenType.RBRACKET, 'Expected ] after array index');
    }

    const operator = this.currentToken.value;
    if (!this.match(
      TokenType.ASSIGN, TokenType.PLUS_ASSIGN, TokenType.MINUS_ASSIGN,
      TokenType.INCREMENT, TokenType.DECREMENT
    )) {
      throw new Error(`Expected assignment operator at line ${line}:${column}`);
    }
    this.advance();

    let expression;
    if (operator === '++' || operator === '--') {
      const identNode = new IdentifierNode(identifier, arrayIndex, line, column);
      expression = new UnaryExpressionNode(operator, identNode, line, column);
    } else {
      expression = this.parseExpression();
    }

    return new AssignmentNode(identifier, arrayIndex, operator, expression, line, column);
  }

  /* ---------- expression precedence ---------- */

  parseExpression() {
    return this.parseLogicalOr();
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    while (this.match(TokenType.OR)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseLogicalAnd();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseLogicalAnd() {
    let left = this.parseBitwiseOr();
    while (this.match(TokenType.AND)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseBitwiseOr();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseBitwiseOr() {
    let left = this.parseBitwiseXor();
    while (this.match(TokenType.BIT_OR)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseBitwiseXor();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseBitwiseXor() {
    let left = this.parseBitwiseAnd();
    while (this.match(TokenType.BIT_XOR)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseBitwiseAnd();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseBitwiseAnd() {
    let left = this.parseEquality();
    while (this.match(TokenType.BIT_AND)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseEquality();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseEquality() {
    let left = this.parseRelational();
    while (this.match(TokenType.EQ, TokenType.NE)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseRelational();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseRelational() {
    let left = this.parseShift();
    while (this.match(TokenType.LT, TokenType.GT, TokenType.LE, TokenType.GE)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseShift();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseShift() {
    let left = this.parseAdditive();
    while (this.match(TokenType.LEFT_SHIFT, TokenType.RIGHT_SHIFT)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseAdditive();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseMultiplicative();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const right = this.parseUnary();
      left = new BinaryExpressionNode(left, operator, right, line, column);
    }
    return left;
  }

  parseUnary() {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.INCREMENT, TokenType.DECREMENT)) {
      const operator = this.currentToken.value;
      const line = this.currentToken.line;
      const column = this.currentToken.column;
      this.advance();
      const operand = this.parseUnary();
      return new UnaryExpressionNode(operator, operand, line, column);
    }
    return this.parsePrimary();
  }

  /* ---------- primary + function call ---------- */

  parsePrimary() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    // number
    if (this.match(TokenType.NUMBER)) {
      const value = this.currentToken.value;
      this.advance();
      return new LiteralNode(value, 'number', line, column);
    }

    // char literal
    if (this.match(TokenType.CHAR_LITERAL)) {
      const value = this.currentToken.value;
      this.advance();
      return new LiteralNode(value, 'char', line, column);
    }

    // string literal
    if (this.match(TokenType.STRING_LITERAL)) {
      const value = this.currentToken.value;
      this.advance();
      return new LiteralNode(value, 'string', line, column);
    }

    // identifier or function call or array access
    if (this.match(TokenType.IDENTIFIER)) {
      const next = this.peek(1);

      if (next.type === TokenType.LPAREN) {
        // function call expression
        return this.parseFunctionCallExpression();
      }

      // normal identifier (maybe array access)
      const name = this.currentToken.value;
      this.advance();

      let arrayIndex = null;
      if (this.match(TokenType.LBRACKET)) {
        this.advance();
        arrayIndex = this.parseExpression();
        this.expect(TokenType.RBRACKET, 'Expected ] after array index');
      }

      return new IdentifierNode(name, arrayIndex, line, column);
    }

    // parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected ) after expression');
      return expr;
    }

    throw new Error(`Unexpected token ${this.currentToken.type} at line ${line}:${column}`);
  }

  /**
   * Function call expression:
   *   foo( expr1, expr2, ... )
   * Current token is IDENTIFIER.
   */
  parseFunctionCallExpression() {
    const line = this.currentToken.line;
    const column = this.currentToken.column;

    const functionName = this.currentToken.value;
    this.advance(); // consume IDENTIFIER

    this.expect(TokenType.LPAREN, 'Expected ( after function name');

    const args = [];
    if (!this.match(TokenType.RPAREN)) {
      while (true) {
        args.push(this.parseExpression());
        if (!this.match(TokenType.COMMA)) break;
        this.advance();
      }
    }

    this.expect(TokenType.RPAREN, 'Expected ) after function arguments');

    return new FunctionCallNode(functionName, args, line, column);
  }
}

module.exports = { Parser };
