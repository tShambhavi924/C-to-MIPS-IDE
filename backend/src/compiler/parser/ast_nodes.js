// // backend/src/compiler/parser/ast_nodes.js

// /**
//  * Base AST Node class
//  */
// class ASTNode {
//   constructor(type, line, column) {
//     this.type = type;
//     this.line = line;
//     this.column = column;
//   }
  
//   toString(indent = 0) {
//     return ' '.repeat(indent) + this.type;
//   }
// }

// /**
//  * Program Node - Root of the AST
//  */
// class ProgramNode extends ASTNode {
//   constructor() {
//     super('Program', 1, 1);
//     this.declarations = [];
//     this.statements = [];
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + 'Program\n';
    
//     if (this.declarations.length > 0) {
//       result += ' '.repeat(indent + 2) + 'Declarations:\n';
//       this.declarations.forEach(decl => {
//         result += decl.toString(indent + 4) + '\n';
//       });
//     }
    
//     if (this.statements.length > 0) {
//       result += ' '.repeat(indent + 2) + 'Statements:\n';
//       this.statements.forEach(stmt => {
//         result += stmt.toString(indent + 4) + '\n';
//       });
//     }
    
//     return result;
//   }
// }

// /**
//  * Declaration Node - Variable/Array declarations
//  */
// class DeclarationNode extends ASTNode {
//   constructor(dataType, identifier, isArray, arraySize, initialValue, line, column) {
//     super('Declaration', line, column);
//     this.dataType = dataType;       // 'int' or 'char'
//     this.identifier = identifier;   // variable name
//     this.isArray = isArray;         // boolean
//     this.arraySize = arraySize;     // number or null
//     this.initialValue = initialValue; // expression or null
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + `Declaration: ${this.dataType} ${this.identifier}`;
//     if (this.isArray) {
//       result += `[${this.arraySize || ''}]`;
//     }
//     if (this.initialValue) {
//       result += ' = ' + this.initialValue.toString(0);
//     }
//     return result;
//   }
// }

// /**
//  * Assignment Node
//  */
// class AssignmentNode extends ASTNode {
//   constructor(identifier, arrayIndex, operator, expression, line, column) {
//     super('Assignment', line, column);
//     this.identifier = identifier;
//     this.arrayIndex = arrayIndex;   // expression or null for non-arrays
//     this.operator = operator;       // '=', '+=', '-='
//     this.expression = expression;
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + `Assignment: ${this.identifier}`;
//     if (this.arrayIndex) {
//       result += '[' + this.arrayIndex.toString(0) + ']';
//     }
//     result += ` ${this.operator} `;
//     result += this.expression.toString(0);
//     return result;
//   }
// }

// /**
//  * If Statement Node
//  */
// class IfStatementNode extends ASTNode {
//   constructor(condition, thenBlock, elseBlock, line, column) {
//     super('IfStatement', line, column);
//     this.condition = condition;
//     this.thenBlock = thenBlock;     // array of statements
//     this.elseBlock = elseBlock;     // array of statements or null
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + 'If\n';
//     result += ' '.repeat(indent + 2) + 'Condition: ' + this.condition.toString(0) + '\n';
//     result += ' '.repeat(indent + 2) + 'Then:\n';
//     this.thenBlock.forEach(stmt => {
//       result += stmt.toString(indent + 4) + '\n';
//     });
//     if (this.elseBlock) {
//       result += ' '.repeat(indent + 2) + 'Else:\n';
//       this.elseBlock.forEach(stmt => {
//         result += stmt.toString(indent + 4) + '\n';
//       });
//     }
//     return result;
//   }
// }

// /**
//  * For Loop Node
//  */
// class ForLoopNode extends ASTNode {
//   constructor(init, condition, update, body, line, column) {
//     super('ForLoop', line, column);
//     this.init = init;               // assignment or declaration
//     this.condition = condition;     // expression
//     this.update = update;           // assignment
//     this.body = body;               // array of statements
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + 'For\n';
//     result += ' '.repeat(indent + 2) + 'Init: ' + this.init.toString(0) + '\n';
//     result += ' '.repeat(indent + 2) + 'Condition: ' + this.condition.toString(0) + '\n';
//     result += ' '.repeat(indent + 2) + 'Update: ' + this.update.toString(0) + '\n';
//     result += ' '.repeat(indent + 2) + 'Body:\n';
//     this.body.forEach(stmt => {
//       result += stmt.toString(indent + 4) + '\n';
//     });
//     return result;
//   }
// }

// /**
//  * While Loop Node
//  */
// class WhileLoopNode extends ASTNode {
//   constructor(condition, body, line, column) {
//     super('WhileLoop', line, column);
//     this.condition = condition;
//     this.body = body;
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + 'While\n';
//     result += ' '.repeat(indent + 2) + 'Condition: ' + this.condition.toString(0) + '\n';
//     result += ' '.repeat(indent + 2) + 'Body:\n';
//     this.body.forEach(stmt => {
//       result += stmt.toString(indent + 4) + '\n';
//     });
//     return result;
//   }
// }

// /**
//  * Do-While Loop Node
//  */
// class DoWhileLoopNode extends ASTNode {
//   constructor(body, condition, line, column) {
//     super('DoWhileLoop', line, column);
//     this.body = body;
//     this.condition = condition;
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + 'DoWhile\n';
//     result += ' '.repeat(indent + 2) + 'Body:\n';
//     this.body.forEach(stmt => {
//       result += stmt.toString(indent + 4) + '\n';
//     });
//     result += ' '.repeat(indent + 2) + 'Condition: ' + this.condition.toString(0) + '\n';
//     return result;
//   }
// }

// /**
//  * Printf Statement Node
//  */
// class PrintfNode extends ASTNode {
//   constructor(formatString, expressions, line, column) {
//     super('Printf', line, column);
//     this.formatString = formatString;
//     this.expressions = expressions; // array of expressions
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + `Printf: "${this.formatString}"`;
//     if (this.expressions.length > 0) {
//       result += ', ' + this.expressions.map(e => e.toString(0)).join(', ');
//     }
//     return result;
//   }
// }

// /**
//  * Scanf Statement Node
//  */
// class ScanfNode extends ASTNode {
//   constructor(formatString, identifiers, line, column) {
//     super('Scanf', line, column);
//     this.formatString = formatString;
//     this.identifiers = identifiers; // array of identifier strings
//   }
  
//   toString(indent = 0) {
//     return ' '.repeat(indent) + `Scanf: "${this.formatString}", ${this.identifiers.join(', ')}`;
//   }
// }

// /**
//  * Binary Expression Node
//  */
// class BinaryExpressionNode extends ASTNode {
//   constructor(left, operator, right, line, column) {
//     super('BinaryExpression', line, column);
//     this.left = left;
//     this.operator = operator;
//     this.right = right;
//   }
  
//   toString(indent = 0) {
//     return `(${this.left.toString(0)} ${this.operator} ${this.right.toString(0)})`;
//   }
// }

// /**
//  * Unary Expression Node
//  */
// class UnaryExpressionNode extends ASTNode {
//   constructor(operator, operand, line, column) {
//     super('UnaryExpression', line, column);
//     this.operator = operator;
//     this.operand = operand;
//   }
  
//   toString(indent = 0) {
//     return `(${this.operator}${this.operand.toString(0)})`;
//   }
// }

// /**
//  * Identifier Node
//  */
// class IdentifierNode extends ASTNode {
//   constructor(name, arrayIndex, line, column) {
//     super('Identifier', line, column);
//     this.name = name;
//     this.arrayIndex = arrayIndex; // expression or null
//   }
  
//   toString(indent = 0) {
//     let result = this.name;
//     if (this.arrayIndex) {
//       result += '[' + this.arrayIndex.toString(0) + ']';
//     }
//     return result;
//   }
// }

// /**
//  * Literal Node (numbers, characters)
//  */
// class LiteralNode extends ASTNode {
//   constructor(value, literalType, line, column) {
//     super('Literal', line, column);
//     this.value = value;
//     this.literalType = literalType; // 'number', 'char', 'string'
//   }
  
//   toString(indent = 0) {
//     if (this.literalType === 'char') {
//       return `'${this.value}'`;
//     } else if (this.literalType === 'string') {
//       return `"${this.value}"`;
//     }
//     return this.value.toString();
//   }
// }

// /**
//  * Expression Statement Node (for expressions used as statements like i++)
//  */
// class ExpressionStatementNode extends ASTNode {
//   constructor(expression, line, column) {
//     super('ExpressionStatement', line, column);
//     this.expression = expression;
//   }
  
//   toString(indent = 0) {
//     return ' '.repeat(indent) + this.expression.toString(0);
//   }
// }

// /**
//  * Block Node (compound statement)
//  */
// class BlockNode extends ASTNode {
//   constructor(statements, line, column) {
//     super('Block', line, column);
//     this.statements = statements;
//   }
  
//   toString(indent = 0) {
//     let result = ' '.repeat(indent) + 'Block\n';
//     this.statements.forEach(stmt => {
//       result += stmt.toString(indent + 2) + '\n';
//     });
//     return result;
//   }
// }

// module.exports = {
//   ASTNode,
//   ProgramNode,
//   DeclarationNode,
//   AssignmentNode,
//   IfStatementNode,
//   ForLoopNode,
//   WhileLoopNode,
//   DoWhileLoopNode,
//   PrintfNode,
//   ScanfNode,
//   BinaryExpressionNode,
//   UnaryExpressionNode,
//   IdentifierNode,
//   LiteralNode,
//   ExpressionStatementNode,
//   BlockNode
// };
// backend/src/compiler/parser/ast_nodes.js

/**
 * AST Node Base Class
 */
class ASTNode {
  constructor(type, line, column) {
    this.type = type;
    this.line = line;
    this.column = column;
  }
}

/**
 * Program Node (root)
 */
class ProgramNode {
  constructor() {
    this.functions = [];
    this.declarations = [];
    this.statements = [];
  }
}



/**
 * Function Declaration Node
 */
class FunctionDeclarationNode {
  constructor(returnType, name, params, bodyStatements, line, column) {
    this.type = 'FunctionDeclaration';
    this.returnType = returnType;
    this.name = name;
    this.params = params;             // [{ type, name }]
    this.bodyStatements = bodyStatements; // 👈 IMPORTANT NAME
    this.line = line;
    this.column = column;
  }
}


/**
 * Return Statement Node
 */
class ReturnStatementNode extends ASTNode {
  constructor(expression, line, column) {
    super('ReturnStatement', line, column);
    this.expression = expression;  // Can be null for void return
  }
}

/**
 * Function Call Node
 */
class FunctionCallNode extends ASTNode {
  constructor(name, args, line, column) {
    super('FunctionCall', line, column);
    this.name = name;
    this.args = args;  // Array of expressions
  }
}

/**
 * Declaration Node
 */
class DeclarationNode extends ASTNode {
  constructor(dataType, identifier, isArray, arraySize, initialValue, line, column) {
    super('Declaration', line, column);
    this.dataType = dataType;
    this.identifier = identifier;
    this.isArray = isArray;
    this.arraySize = arraySize;
    this.initialValue = initialValue;
  }
}

/**
 * Assignment Node
 */
class AssignmentNode extends ASTNode {
  constructor(identifier, arrayIndex, operator, expression, line, column) {
    super('Assignment', line, column);
    this.identifier = identifier;
    this.arrayIndex = arrayIndex;
    this.operator = operator;
    this.expression = expression;
  }
}

/**
 * If Statement Node
 */
class IfStatementNode extends ASTNode {
  constructor(condition, thenBlock, elseBlock, line, column) {
    super('IfStatement', line, column);
    this.condition = condition;
    this.thenBlock = thenBlock;
    this.elseBlock = elseBlock;
  }
}

/**
 * For Loop Node
 */
class ForLoopNode extends ASTNode {
  constructor(init, condition, update, body, line, column) {
    super('ForLoop', line, column);
    this.init = init;
    this.condition = condition;
    this.update = update;
    this.body = body;
  }
}

/**
 * While Loop Node
 */
class WhileLoopNode extends ASTNode {
  constructor(condition, body, line, column) {
    super('WhileLoop', line, column);
    this.condition = condition;
    this.body = body;
  }
}

/**
 * Do-While Loop Node
 */
class DoWhileLoopNode extends ASTNode {
  constructor(body, condition, line, column) {
    super('DoWhileLoop', line, column);
    this.body = body;
    this.condition = condition;
  }
}

/**
 * Printf Node
 */
class PrintfNode extends ASTNode {
  constructor(formatString, expressions, line, column) {
    super('Printf', line, column);
    this.formatString = formatString;
    this.expressions = expressions;
  }
}

/**
 * Scanf Node
 */
class ScanfNode extends ASTNode {
  constructor(formatString, identifiers, line, column) {
    super('Scanf', line, column);
    this.formatString = formatString;
    this.identifiers = identifiers;
  }
}

/**
 * Binary Expression Node
 */
class BinaryExpressionNode extends ASTNode {
  constructor(left, operator, right, line, column) {
    super('BinaryExpression', line, column);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

/**
 * Unary Expression Node
 */
class UnaryExpressionNode extends ASTNode {
  constructor(operator, operand, line, column) {
    super('UnaryExpression', line, column);
    this.operator = operator;
    this.operand = operand;
  }
}

/**
 * Identifier Node
 */
class IdentifierNode extends ASTNode {
  constructor(name, arrayIndex, line, column) {
    super('Identifier', line, column);
    this.name = name;
    this.arrayIndex = arrayIndex;
  }
}

/**
 * Literal Node
 */
class LiteralNode extends ASTNode {
  constructor(value, literalType, line, column) {
    super('Literal', line, column);
    this.value = value;
    this.literalType = literalType;
  }
}

/**
 * Expression Statement Node
 */
class ExpressionStatementNode extends ASTNode {
  constructor(expression, line, column) {
    super('ExpressionStatement', line, column);
    this.expression = expression;
  }
}

/**
 * Block Node
 */
class BlockNode extends ASTNode {
  constructor(statements, line, column) {
    super('Block', line, column);
    this.statements = statements;
  }
}

module.exports = {
  ASTNode,
  ProgramNode,
  FunctionDeclarationNode,
  ReturnStatementNode,
  FunctionCallNode,
  DeclarationNode,
  AssignmentNode,
  IfStatementNode,
  ForLoopNode,
  WhileLoopNode,
  DoWhileLoopNode,
  PrintfNode,
  ScanfNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  IdentifierNode,
  LiteralNode,
  ExpressionStatementNode,
  BlockNode
};