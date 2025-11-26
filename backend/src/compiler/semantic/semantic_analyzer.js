// backend/src/compiler/semantic/semantic_analyzer.js

// We only need these type names for instanceof *if* you want.
// But to be safe, we mostly use string checks on node.type.
// If ast_nodes.js exports these, it's fine; if not, no problem.
let DeclarationNode, AssignmentNode, IdentifierNode, ReturnStatementNode, FunctionDeclarationNode;
try {
  ({
    DeclarationNode,
    AssignmentNode,
    IdentifierNode,
    ReturnStatementNode,
    FunctionDeclarationNode
  } = require('../parser/ast_nodes'));
} catch (e) {
  // Ignore if not found, we'll rely on node.type strings
}

/* ========= Symbols & Symbol Table ========= */

class VariableSymbol {
  constructor(name, type, isArray = false, arraySize = null) {
    this.name = name;
    this.type = type;        // 'int' or 'char'
    this.isArray = isArray;
    this.arraySize = arraySize;
  }
}

class FunctionSymbol {
  constructor(name, returnType, params = []) {
    this.name = name;
    this.returnType = returnType;
    this.params = params; // [{type, name}, ...]
  }
}

class SymbolTable {
  constructor() {
    // we treat everything as "global" storage (no stack locals)
    this.variables = new Map();  // name -> VariableSymbol
    this.functions = new Map();  // name -> FunctionSymbol
  }

  /* ---- variables ---- */

  defineVariable(name, type, isArray = false, arraySize = null) {
    if (!this.variables.has(name)) {
      this.variables.set(name, new VariableSymbol(name, type, isArray, arraySize));
    }
    return this.variables.get(name);
  }

  lookup(name) {
    if (!this.variables.has(name)) {
      throw new Error(`Undefined variable '${name}'`);
    }
    return this.variables.get(name);
  }

  getGlobalSymbols() {
    return Array.from(this.variables.values());
  }

  /* ---- functions ---- */

  defineFunction(name, returnType, params = []) {
    if (!this.functions.has(name)) {
      this.functions.set(name, new FunctionSymbol(name, returnType, params));
    }
    return this.functions.get(name);
  }

  lookupFunction(name) {
    if (!this.functions.has(name)) {
      throw new Error(`Undefined function '${name}'`);
    }
    return this.functions.get(name);
  }

  /* ---- debug / stats ---- */

  getStats() {
    return {
      totalSymbols: this.variables.size,
      totalFunctions: this.functions.size
    };
  }

  print() {
    console.log('=== Symbol Table ===');

    console.log('\nVariables:');
    this.variables.forEach(v => {
      const arr = v.isArray ? `[${v.arraySize}]` : '';
      console.log(`  ${v.type} ${v.name}${arr}`);
    });

    console.log('\nFunctions:');
    this.functions.forEach(f => {
      const params = f.params.map(p => `${p.type} ${p.name}`).join(', ');
      console.log(`  ${f.returnType} ${f.name}(${params})`);
    });
  }
}

/* ========= Semantic Analyzer ========= */

class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new SymbolTable();
    this.warnings = [];
  }

  analyze(ast) {
    // 1. Global declarations like: int n;
    (ast.declarations || []).forEach(decl => this._handleDeclaration(decl));

    // 2. Register functions (name + return type + params)
    (ast.functions || []).forEach(fn => {
      const params = fn.params || fn.parameters || [];
      this.symbolTable.defineFunction(fn.name, fn.returnType, params);
    });

    // 3. Analyze each function body
    (ast.functions || []).forEach(fn => this._analyzeFunction(fn));

    // 4. Top-level statements (programs without main)
    (ast.statements || []).forEach(stmt => this._analyzeStatement(stmt));

    return {
      warnings: this.warnings,
      symbolTable: this.symbolTable
    };
  }

  /* ---- helpers ---- */

  _handleDeclaration(node) {
    // node: { dataType, identifier, isArray, arraySize, initialValue }
    this.symbolTable.defineVariable(
      node.identifier,
      node.dataType,
      node.isArray,
      node.arraySize
    );
    if (node.initialValue) {
      this._analyzeExpression(node.initialValue);
    }
  }

  _analyzeFunction(fnNode) {
    const params = fnNode.params || fnNode.parameters || [];
    // treat parameters as variables too (global-style for now)
    params.forEach(p => {
      this.symbolTable.defineVariable(p.name, p.type, false, null);
    });

    (fnNode.bodyStatements || fnNode.body || []).forEach(stmt =>
      this._analyzeStatement(stmt)
    );
  }

  _isType(node, ...names) {
    const t = node.type;
    return names.includes(t);
  }

  _analyzeStatement(stmt) {
    if (!stmt || typeof stmt !== 'object') return;

    // handle both Foo and FooNode variants
    const t = stmt.type;

    if (this._isType(stmt, 'Declaration', 'DeclarationNode')) {
      this._handleDeclaration(stmt);
      return;
    }

    if (this._isType(stmt, 'Assignment', 'AssignmentNode')) {
      this.symbolTable.lookup(stmt.identifier);
      this._analyzeExpression(stmt.expression);
      return;
    }

    if (this._isType(stmt, 'ReturnStatement', 'ReturnStatementNode')) {
      if (stmt.expression) this._analyzeExpression(stmt.expression);
      return;
    }

    if (this._isType(stmt, 'IfStatement', 'IfStatementNode')) {
      this._analyzeExpression(stmt.condition);
      (stmt.thenBlock || []).forEach(s => this._analyzeStatement(s));
      (stmt.elseBlock || []).forEach(s => this._analyzeStatement(s));
      return;
    }

    if (this._isType(stmt, 'ForLoop', 'ForLoopNode')) {
      if (stmt.init) this._analyzeStatement(stmt.init);
      if (stmt.condition) this._analyzeExpression(stmt.condition);
      if (stmt.update) this._analyzeStatement(stmt.update);
      (stmt.body || []).forEach(s => this._analyzeStatement(s));
      return;
    }

    if (this._isType(stmt, 'WhileLoop', 'WhileLoopNode')) {
      if (stmt.condition) this._analyzeExpression(stmt.condition);
      (stmt.body || []).forEach(s => this._analyzeStatement(s));
      return;
    }

    if (this._isType(stmt, 'DoWhileLoop', 'DoWhileLoopNode')) {
      (stmt.body || []).forEach(s => this._analyzeStatement(s));
      if (stmt.condition) this._analyzeExpression(stmt.condition);
      return;
    }

    if (this._isType(stmt, 'Printf', 'PrintfNode')) {
      (stmt.expressions || []).forEach(e => this._analyzeExpression(e));
      return;
    }

    if (this._isType(stmt, 'Scanf', 'ScanfNode')) {
      (stmt.identifiers || []).forEach(name => {
        this.symbolTable.lookup(name);
      });
      return;
    }

    if (this._isType(stmt, 'ExpressionStatement', 'ExpressionStatementNode')) {
      if (stmt.expression) this._analyzeExpression(stmt.expression);
      return;
    }

    if (this._isType(stmt, 'Block', 'BlockNode')) {
      (stmt.statements || []).forEach(s => this._analyzeStatement(s));
      return;
    }

    // anything else – warn but don't crash
    this.warnings.push(`Unknown statement type: ${t}`);
  }

  _analyzeExpression(expr) {
    if (!expr || typeof expr !== 'object') return;
    const t = expr.type;

    if (this._isType(expr, 'Identifier', 'IdentifierNode')) {
      this.symbolTable.lookup(expr.name);
      return;
    }

    if (this._isType(expr, 'Literal')) {
      return;
    }

    if (this._isType(expr, 'BinaryExpression')) {
      this._analyzeExpression(expr.left);
      this._analyzeExpression(expr.right);
      return;
    }

    if (this._isType(expr, 'UnaryExpression')) {
      this._analyzeExpression(expr.operand);
      return;
    }

    if (this._isType(expr, 'FunctionCall', 'FunctionCallNode')) {
      try {
        this.symbolTable.lookupFunction(expr.name);
      } catch (e) {
        this.warnings.push(e.message);
      }
      (expr.args || []).forEach(a => this._analyzeExpression(a));
      return;
    }

    // else ignore
  }
}

module.exports = {
  SemanticAnalyzer,
  SymbolTable,
  VariableSymbol,
  FunctionSymbol
};
