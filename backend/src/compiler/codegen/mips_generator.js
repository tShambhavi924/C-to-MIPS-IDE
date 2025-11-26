const { RegisterAllocator } = require('./register_allocator');

class MIPSGenerator {
  constructor(ast, symbolTable) {
    this.ast = ast;
    this.symbolTable = symbolTable;
    this.registerAllocator = new RegisterAllocator();
    
    this.dataSection = [];
    this.textSection = [];
    this.currentInstructions = null;
    this.labelCounter = 0;
    this.stringCounter = 0;
    this.stringLiterals = new Map();
    
    this.currentFunctionName = null;
    this.inFunction = false;
  }

  generate() {
    this.generateDataSection();
    this.generateTextSection();
    return this.assembleOutput();
  }

  /* DATA SECTION  */

  generateDataSection() {
    this.dataSection.push('.data');
    
    // Global variables
    const globals = this.symbolTable.getGlobalSymbols ? this.symbolTable.getGlobalSymbols() : [];
    
    globals.forEach(sym => {
      if (sym.isArray) {
        const size = sym.type === 'int' ? sym.arraySize * 4 : sym.arraySize;
        this.dataSection.push(`${sym.name}: .space ${size}    # ${sym.type}[${sym.arraySize}]`);
      } else {
        if (sym.type === 'int') {
          this.dataSection.push(`${sym.name}: .word 0    # int`);
        } else if (sym.type === 'char') {
          this.dataSection.push(`${sym.name}: .byte 0    # char`);
        }
      }
    });
    
    // String literals
    this.dataSection.push('_newline: .asciiz "\\n"');
    this.dataSection.push('_space: .asciiz " "');
    this.dataSection.push('');
  }

  /* TEXT SECTION  */

  generateTextSection() {
    this.textSection.push('.text');
    this.textSection.push('.globl main');
    this.textSection.push('');
    
    this.currentInstructions = this.textSection;
    
   
    if (this.ast.functions && this.ast.functions.length > 0) {
     
      const mainFunc = this.ast.functions.find(f => f.name === 'main');
      if (mainFunc) {
        this.generateFunction(mainFunc);
      }
      
      
      this.ast.functions
        .filter(f => f.name !== 'main')
        .forEach(fn => this.generateFunction(fn));
      
  
      if (!mainFunc) {
        this.emit('main:');
        this.emit('    # Error: No main function found');
        this.emit('    li    $v0, 10');
        this.emit('    syscall');
      }
    } else {
      
      this.emit('main:');
      (this.ast.statements || []).forEach(stmt => this.generateStatement(stmt));
      this.emit('');
      this.emit('    # Exit program');
      this.emit('    li    $v0, 10');
      this.emit('    syscall');
    }
  }

  generateFunction(fn) {
    this.currentFunctionName = fn.name;
    this.inFunction = true;
    this.registerAllocator.reset(); 
    
    // Function label with clear separation
    this.emit('# ----------------------------------------');
    this.emit(`# Function: ${fn.name}`);
    this.emit('# ----------------------------------------');
    this.emit(`${fn.name}:`);
    
    // For non-main functions, set up stack frame
    if (fn.name !== 'main') {
      this.emit('    # Function prologue');
      this.emit('    addi  $sp, $sp, -4');
      this.emit('    sw    $ra, 0($sp)');
      this.emit('');
    }
    
    // Store parameters from $a0-$a3 to memory
    const params = fn.params || [];
    if (params.length > 0) {
      this.emit('    # Store function parameters');
      params.forEach((param, i) => {
        if (i < 4) {
          try {
            const sym = this.symbolTable.lookup(param.name);
            if (sym) {
              const storeOp = param.type === 'int' ? 'sw' : 'sb';
              this.emit(`    ${storeOp}    $a${i}, ${param.name}    # param: ${param.name}`);
            }
          } catch (e) {
            // Parameter not in symbol table - skip
          }
        }
      });
      this.emit('');
    }
    
    // Function body
    this.emit('    # Function body');
    const body = fn.bodyStatements || fn.body || [];
    body.forEach(stmt => this.generateStatement(stmt));
    
    // Function epilogue (default return)
    this.emit('');
    if (fn.name === 'main') {
      this.emit('    # Main function exit');
      this.emit('    li    $v0, 10');
      this.emit('    syscall');
    } else {
      this.emit('    # Function epilogue');
      this.emit('    lw    $ra, 0($sp)');
      this.emit('    addi  $sp, $sp, 4');
      this.emit('    jr    $ra');
    }
    
    this.emit('');
    this.currentFunctionName = null;
    this.inFunction = false;
  }

  /* ==================== STATEMENTS ==================== */

  generateStatement(node) {
    if (!node) return;
    
    const t = node.type;
    
    if (this._isType(node, 'Declaration', 'DeclarationNode')) {
      return this.generateDeclaration(node);
    }
    if (this._isType(node, 'Assignment', 'AssignmentNode')) {
      return this.generateAssignment(node);
    }
    if (this._isType(node, 'IfStatement', 'IfStatementNode')) {
      return this.generateIf(node);
    }
    if (this._isType(node, 'ForLoop', 'ForLoopNode')) {
      return this.generateFor(node);
    }
    if (this._isType(node, 'WhileLoop', 'WhileLoopNode')) {
      return this.generateWhile(node);
    }
    if (this._isType(node, 'DoWhileLoop', 'DoWhileLoopNode')) {
      return this.generateDoWhile(node);
    }
    if (this._isType(node, 'Printf', 'PrintfNode')) {
      return this.generatePrintf(node);
    }
    if (this._isType(node, 'Scanf', 'ScanfNode')) {
      return this.generateScanf(node);
    }
    if (this._isType(node, 'ReturnStatement', 'ReturnStatementNode')) {
      return this.generateReturn(node);
    }
    if (this._isType(node, 'ExpressionStatement', 'ExpressionStatementNode')) {
      if (node.expression) {
        this.generateExpression(node.expression);
      }
      return;
    }
    if (this._isType(node, 'Block', 'BlockNode')) {
      (node.statements || []).forEach(s => this.generateStatement(s));
      return;
    }
    
    this.emit(`    # Warning: Unknown statement type ${t}`);
  }

  generateDeclaration(node) {
    // Only handle initialization
    if (node.initialValue) {
      const reg = this.generateExpression(node.initialValue);
      this.storeVariable(node.identifier, node.arrayIndex || null, reg);
    }
  }

  generateAssignment(node) {
    this.emit(`    # Assignment: ${node.identifier} ${node.operator}`);
    
    const rhsReg = this.generateExpression(node.expression);
    
    if (node.operator === '=') {
      this.storeVariable(node.identifier, node.arrayIndex, rhsReg);
    } else if (node.operator === '+=') {
      const varReg = this.loadVariable(node.identifier, node.arrayIndex);
      const res = this.registerAllocator.allocateTemp();
      this.emit(`    add   ${res}, ${varReg}, ${rhsReg}`);
      this.storeVariable(node.identifier, node.arrayIndex, res);
    } else if (node.operator === '-=') {
      const varReg = this.loadVariable(node.identifier, node.arrayIndex);
      const res = this.registerAllocator.allocateTemp();
      this.emit(`    sub   ${res}, ${varReg}, ${rhsReg}`);
      this.storeVariable(node.identifier, node.arrayIndex, res);
    } else if (node.operator === '*=') {
      const varReg = this.loadVariable(node.identifier, node.arrayIndex);
      const res = this.registerAllocator.allocateTemp();
      this.emit(`    mul   ${res}, ${varReg}, ${rhsReg}`);
      this.storeVariable(node.identifier, node.arrayIndex, res);
    } else if (node.operator === '/=') {
      const varReg = this.loadVariable(node.identifier, node.arrayIndex);
      this.emit(`    div   ${varReg}, ${rhsReg}`);
      const res = this.registerAllocator.allocateTemp();
      this.emit(`    mflo  ${res}`);
      this.storeVariable(node.identifier, node.arrayIndex, res);
    } else if (node.operator === '%=') {
      const varReg = this.loadVariable(node.identifier, node.arrayIndex);
      this.emit(`    div   ${varReg}, ${rhsReg}`);
      const res = this.registerAllocator.allocateTemp();
      this.emit(`    mfhi  ${res}`);
      this.storeVariable(node.identifier, node.arrayIndex, res);
    }
  }

  generateIf(node) {
    const elseLabel = this.newLabel('else');
    const endLabel = this.newLabel('endif');
    
    this.emit('    # If statement');
    const condReg = this.generateExpression(node.condition);
    
    const hasElse = node.elseBlock && node.elseBlock.length > 0;
    
    if (hasElse) {
      this.emit(`    beq   ${condReg}, $zero, ${elseLabel}`);
    } else {
      this.emit(`    beq   ${condReg}, $zero, ${endLabel}`);
    }
    
    // Then block
    (node.thenBlock || []).forEach(s => this.generateStatement(s));
    
    if (hasElse) {
      this.emit(`    j     ${endLabel}`);
      this.emit(`${elseLabel}:`);
      (node.elseBlock || []).forEach(s => this.generateStatement(s));
    }
    
    this.emit(`${endLabel}:`);
  }

  generateFor(node) {
    const startLabel = this.newLabel('for_start');
    const endLabel = this.newLabel('for_end');
    
    this.emit('    # For loop');
    
    // Initialization
    if (node.init) {
      this.generateStatement(node.init);
    }
    
    this.emit(`${startLabel}:`);
    
    // Condition
    if (node.condition) {
      const condReg = this.generateExpression(node.condition);
      this.emit(`    beq   ${condReg}, $zero, ${endLabel}`);
    }
    
    // Body
    (node.body || []).forEach(s => this.generateStatement(s));
    
    // Update
    if (node.update) {
      this.generateStatement(node.update);
    }
    
    this.emit(`    j     ${startLabel}`);
    this.emit(`${endLabel}:`);
  }

  generateWhile(node) {
    const startLabel = this.newLabel('while_start');
    const endLabel = this.newLabel('while_end');
    
    this.emit('    # While loop');
    this.emit(`${startLabel}:`);
    
    const condReg = this.generateExpression(node.condition);
    this.emit(`    beq   ${condReg}, $zero, ${endLabel}`);
    
    (node.body || []).forEach(s => this.generateStatement(s));
    
    this.emit(`    j     ${startLabel}`);
    this.emit(`${endLabel}:`);
  }

  generateDoWhile(node) {
    const startLabel = this.newLabel('do_start');
    const endLabel = this.newLabel('do_end');
    
    this.emit('    # Do-while loop');
    this.emit(`${startLabel}:`);
    
    (node.body || []).forEach(s => this.generateStatement(s));
    
    const condReg = this.generateExpression(node.condition);
    this.emit(`    bne   ${condReg}, $zero, ${startLabel}`);
    this.emit(`${endLabel}:`);
  }

  generatePrintf(node) {
    this.emit('    # Printf');
    
    const formatStr = node.formatString;
    const specs = formatStr.match(/%[dcsf]/g) || [];
    const exprs = node.expressions || [];
    
    specs.forEach((spec, i) => {
      if (i >= exprs.length) return;
      
      const reg = this.generateExpression(exprs[i]);
      
      if (spec === '%d') {
        this.emit(`    move  $a0, ${reg}`);
        this.emit('    li    $v0, 1    # print int');
        this.emit('    syscall');
      } else if (spec === '%c') {
        this.emit(`    move  $a0, ${reg}`);
        this.emit('    li    $v0, 11   # print char');
        this.emit('    syscall');
      } else if (spec === '%s') {
        this.emit(`    move  $a0, ${reg}`);
        this.emit('    li    $v0, 4    # print string');
        this.emit('    syscall');
      }
    });
    
    // Handle newline
    if (formatStr.includes('\\n')) {
      this.emit('    la    $a0, _newline');
      this.emit('    li    $v0, 4    # print string');
      this.emit('    syscall');
    }
    
    // Handle space
    if (formatStr.includes(' ') && !formatStr.includes('\\n')) {
      this.emit('    la    $a0, _space');
      this.emit('    li    $v0, 4    # print string');
      this.emit('    syscall');
    }
  }

  generateScanf(node) {
    this.emit('    # Scanf');
    
    const specs = node.formatString.match(/%[dcs]/g) || [];
    const ids = node.identifiers || [];
    
    specs.forEach((spec, i) => {
      if (i >= ids.length) return;
      
      const name = ids[i];
      
      if (spec === '%d') {
        this.emit('    li    $v0, 5    # read int');
        this.emit('    syscall');
        this.storeVariable(name, null, '$v0');
      } else if (spec === '%c') {
        this.emit('    li    $v0, 12   # read char');
        this.emit('    syscall');
        this.storeVariable(name, null, '$v0');
      }
    });
  }

  generateReturn(node) {
    this.emit('    # Return statement');
    
    // Compute return value into $v0
    if (node.expression) {
      const reg = this.generateExpression(node.expression);
      this.emit(`    move  $v0, ${reg}`);
    }
    
    // Return logic
    if (this.currentFunctionName === 'main') {
      this.emit('    li    $v0, 10');
      this.emit('    syscall');
    } else {
      this.emit('    lw    $ra, 0($sp)');
      this.emit('    addi  $sp, $sp, 4');
      this.emit('    jr    $ra');
    }
  }

  /* ==================== EXPRESSIONS ==================== */

  generateExpression(node) {
    if (!node) return '$zero';
    
    const t = node.type;
    
    if (this._isType(node, 'Literal')) {
      return this.generateLiteral(node);
    }
    if (this._isType(node, 'Identifier', 'IdentifierNode')) {
      return this.generateIdentifier(node);
    }
    if (this._isType(node, 'BinaryExpression')) {
      return this.generateBinary(node);
    }
    if (this._isType(node, 'UnaryExpression')) {
      return this.generateUnary(node);
    }
    if (this._isType(node, 'FunctionCall', 'FunctionCallNode')) {
      return this.generateFunctionCall(node);
    }
    
    this.emit(`    # Warning: Unknown expression ${t}`);
    return '$zero';
  }

  generateLiteral(node) {
    const reg = this.registerAllocator.allocateTemp();
    
    if (node.literalType === 'number') {
      const value = node.value.startsWith('0x')
        ? parseInt(node.value, 16)
        : parseInt(node.value, 10);
      this.emit(`    li    ${reg}, ${value}`);
    } else if (node.literalType === 'char') {
      let charValue;
      if (node.value.startsWith('\\')) {
        const escapeMap = {
          'n': 10, 't': 9, 'r': 13, '0': 0,
          '\\': 92, "'": 39, '"': 34
        };
        charValue = escapeMap[node.value[1]] || node.value.charCodeAt(1);
      } else {
        charValue = node.value.charCodeAt(0);
      }
      this.emit(`    li    ${reg}, ${charValue}`);
    } else {
      this.emit(`    li    ${reg}, 0`);
    }
    
    return reg;
  }

  generateIdentifier(node) {
    return this.loadVariable(node.name, node.arrayIndex);
  }

  generateBinary(node) {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    const res = this.registerAllocator.allocateTemp();
    
    const op = node.operator;
    
    // Arithmetic operators
    if (op === '+') {
      this.emit(`    add   ${res}, ${left}, ${right}`);
    } else if (op === '-') {
      this.emit(`    sub   ${res}, ${left}, ${right}`);
    } else if (op === '*') {
      this.emit(`    mul   ${res}, ${left}, ${right}`);
    } else if (op === '/') {
      this.emit(`    div   ${left}, ${right}`);
      this.emit(`    mflo  ${res}`);
    } else if (op === '%') {
      this.emit(`    div   ${left}, ${right}`);
      this.emit(`    mfhi  ${res}`);
    }
    
    // Relational operators
    else if (op === '<') {
      this.emit(`    slt   ${res}, ${left}, ${right}`);
    } else if (op === '>') {
      this.emit(`    slt   ${res}, ${right}, ${left}`);
    } else if (op === '<=') {
      this.emit(`    slt   ${res}, ${right}, ${left}`);
      this.emit(`    xori  ${res}, ${res}, 1`);
    } else if (op === '>=') {
      this.emit(`    slt   ${res}, ${left}, ${right}`);
      this.emit(`    xori  ${res}, ${res}, 1`);
    } else if (op === '==') {
      this.emit(`    sub   ${res}, ${left}, ${right}`);
      this.emit(`    sltiu ${res}, ${res}, 1`);
    } else if (op === '!=') {
      this.emit(`    sub   ${res}, ${left}, ${right}`);
      this.emit(`    sltu  ${res}, $zero, ${res}`);
    }
    
    // Logical operators
    else if (op === '&&') {
      this.emit(`    and   ${res}, ${left}, ${right}`);
      this.emit(`    sltu  ${res}, $zero, ${res}`);
    } else if (op === '||') {
      this.emit(`    or    ${res}, ${left}, ${right}`);
      this.emit(`    sltu  ${res}, $zero, ${res}`);
    }
    
    // Bitwise operators
    else if (op === '&') {
      this.emit(`    and   ${res}, ${left}, ${right}`);
    } else if (op === '|') {
      this.emit(`    or    ${res}, ${left}, ${right}`);
    } else if (op === '^') {
      this.emit(`    xor   ${res}, ${left}, ${right}`);
    } else if (op === '<<') {
      this.emit(`    sllv  ${res}, ${left}, ${right}`);
    } else if (op === '>>') {
      this.emit(`    srlv  ${res}, ${left}, ${right}`);
    }
    
    else {
      this.emit(`    # Unknown operator: ${op}`);
      this.emit(`    move  ${res}, $zero`);
    }
    
    return res;
  }

  generateUnary(node) {
    const operand = this.generateExpression(node.operand);
    const res = this.registerAllocator.allocateTemp();
    
    const op = node.operator;
    
    if (op === '-') {
      this.emit(`    sub   ${res}, $zero, ${operand}`);
    } else if (op === '!') {
      this.emit(`    sltiu ${res}, ${operand}, 1`);
    } else if (op === '~') {
      this.emit(`    nor   ${res}, ${operand}, $zero`);
    } else if (op === '++') {
      this.emit(`    addi  ${res}, ${operand}, 1`);
      if (this._isType(node.operand, 'Identifier', 'IdentifierNode')) {
        this.storeVariable(node.operand.name, node.operand.arrayIndex, res);
      }
    } else if (op === '--') {
      this.emit(`    addi  ${res}, ${operand}, -1`);
      if (this._isType(node.operand, 'Identifier', 'IdentifierNode')) {
        this.storeVariable(node.operand.name, node.operand.arrayIndex, res);
      }
    } else {
      this.emit(`    # Unknown unary operator: ${op}`);
      this.emit(`    move  ${res}, ${operand}`);
    }
    
    return res;
  }

  generateFunctionCall(node) {
    this.emit(`    # Call function: ${node.name}`);
    
    // Save $t0-$t9 if we're in a function (caller-save)
    const tempsToSave = ['$t0', '$t1', '$t2', '$t3', '$t4'];
    if (this.inFunction) {
      this.emit('    # Save caller-saved registers');
      tempsToSave.forEach((reg, i) => {
        this.emit(`    addi  $sp, $sp, -4`);
        this.emit(`    sw    ${reg}, 0($sp)`);
      });
    }
    
    // Evaluate arguments and store in $a0-$a3
    const args = node.args || [];
    const argRegs = [];
    
    // First evaluate all arguments into temporary registers
    args.forEach((arg, i) => {
      if (i < 4) {
        const reg = this.generateExpression(arg);
        argRegs.push(reg);
      }
    });
    
    // Then move them to argument registers
    argRegs.forEach((reg, i) => {
      this.emit(`    move  $a${i}, ${reg}    # argument ${i}`);
    });
    
    // Call the function
    this.emit(`    jal   ${node.name}`);
    
    // Restore caller-saved registers
    if (this.inFunction) {
      this.emit('    # Restore caller-saved registers');
      for (let i = tempsToSave.length - 1; i >= 0; i--) {
        this.emit(`    lw    ${tempsToSave[i]}, 0($sp)`);
        this.emit(`    addi  $sp, $sp, 4`);
      }
    }
    
    // Result is in $v0, move to a temp register
    const res = this.registerAllocator.allocateTemp();
    this.emit(`    move  ${res}, $v0    # store return value`);
    
    return res;
  }

  /* ==================== MEMORY OPERATIONS ==================== */

  loadVariable(name, arrayIndex) {
    const sym = this.symbolTable.lookup(name);
    const reg = this.registerAllocator.allocateTemp();
    
    if (sym.isArray) {
      // Load array address
      this.emit(`    la    ${reg}, ${name}`);
      
      if (arrayIndex) {
        const idxReg = this.generateExpression(arrayIndex);
        const offsetReg = this.registerAllocator.allocateTemp();
        const elemSize = sym.type === 'int' ? 4 : 1;
        
        if (elemSize === 4) {
          this.emit(`    sll   ${offsetReg}, ${idxReg}, 2`);
        } else {
          this.emit(`    move  ${offsetReg}, ${idxReg}`);
        }
        
        this.emit(`    add   ${reg}, ${reg}, ${offsetReg}`);
        const loadOp = sym.type === 'int' ? 'lw' : 'lb';
        this.emit(`    ${loadOp}    ${reg}, 0(${reg})`);
      }
    } else {
      // Load scalar variable
      const loadOp = sym.type === 'int' ? 'lw' : 'lb';
      this.emit(`    ${loadOp}    ${reg}, ${name}`);
    }
    
    return reg;
  }

  storeVariable(name, arrayIndex, srcReg) {
    const sym = this.symbolTable.lookup(name);
    
    if (sym.isArray && arrayIndex) {
      const baseReg = this.registerAllocator.allocateTemp();
      const idxReg = this.generateExpression(arrayIndex);
      const offsetReg = this.registerAllocator.allocateTemp();
      const elemSize = sym.type === 'int' ? 4 : 1;
      
      this.emit(`    la    ${baseReg}, ${name}`);
      
      if (elemSize === 4) {
        this.emit(`    sll   ${offsetReg}, ${idxReg}, 2`);
      } else {
        this.emit(`    move  ${offsetReg}, ${idxReg}`);
      }
      
      this.emit(`    add   ${baseReg}, ${baseReg}, ${offsetReg}`);
      
      const storeOp = sym.type === 'int' ? 'sw' : 'sb';
      this.emit(`    ${storeOp}    ${srcReg}, 0(${baseReg})`);
    } else {
      // Store to scalar variable
      const storeOp = sym.type === 'int' ? 'sw' : 'sb';
      this.emit(`    ${storeOp}    ${srcReg}, ${name}`);
    }
  }

  /* ==================== UTILITIES ==================== */

  _isType(node, ...types) {
    return node && types.includes(node.type);
  }

  emit(line) {
    if (!this.currentInstructions) {
      this.currentInstructions = this.textSection;
    }
    this.currentInstructions.push(line);
  }

  newLabel(prefix) {
    return `${prefix}_${this.labelCounter++}`;
  }

  assembleOutput() {
    const lines = [
      '# ============================================',
      '# Generated MIPS Assembly Code',
      '# C-to-MIPS Compiler',
      '# ============================================',
      '',
      ...this.dataSection,
      '',
      ...this.textSection
    ];
    return lines.join('\n');
  }

  getStats() {
    return {
      dataLines: this.dataSection.length,
      textLines: this.textSection.length,
      totalLines: this.dataSection.length + this.textSection.length,
      labelsGenerated: this.labelCounter,
      registerStats: this.registerAllocator.getStats()
    };
  }
}

module.exports = { MIPSGenerator };