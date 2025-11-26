// // backend/src/compiler/semantic/symbol_table.js

// /**
//  * Symbol class representing a variable or array
//  */
// class Symbol {
//   constructor(name, type, isArray, arraySize, scopeLevel, memoryLocation) {
//     this.name = name;
//     this.type = type;               // 'int' or 'char'
//     this.isArray = isArray;         // boolean
//     this.arraySize = arraySize;     // number or null
//     this.scopeLevel = scopeLevel;   // 0 for global, 1+ for nested scopes
//     this.memoryLocation = memoryLocation; // For code generation
//     this.isInitialized = false;     // Track if variable has been assigned
//     this.register = null;           // Assigned register (if any)
//   }
  
//   toString() {
//     let result = `${this.name}: ${this.type}`;
//     if (this.isArray) {
//       result += `[${this.arraySize}]`;
//     }
//     result += ` (scope: ${this.scopeLevel}`;
//     if (this.register) {
//       result += `, reg: ${this.register}`;
//     }
//     result += ')';
//     return result;
//   }
// }

// /**
//  * Scope class representing a lexical scope
//  */
// class Scope {
//   constructor(level, parent = null) {
//     this.level = level;
//     this.parent = parent;
//     this.symbols = new Map(); // name -> Symbol
//   }
  
//   /**
//    * Add symbol to current scope
//    */
//   define(name, symbol) {
//     if (this.symbols.has(name)) {
//       throw new Error(
//         `Variable '${name}' already declared in current scope at level ${this.level}`
//       );
//     }
//     this.symbols.set(name, symbol);
//   }
  
//   /**
//    * Lookup symbol in current scope only
//    */
//   lookup(name) {
//     return this.symbols.get(name) || null;
//   }
  
//   /**
//    * Get all symbols in current scope
//    */
//   getAllSymbols() {
//     return Array.from(this.symbols.values());
//   }
// }

// /**
//  * Symbol Table managing scopes and symbols
//  */
// class SymbolTable {
//   constructor() {
//     this.globalScope = new Scope(0, null);
//     this.currentScope = this.globalScope;
//     this.scopeLevel = 0;
//     this.nextMemoryOffset = 0; // For .data section allocation
//   }
  
//   /**
//    * Enter a new scope (for blocks, functions)
//    */
//   enterScope() {
//     this.scopeLevel++;
//     const newScope = new Scope(this.scopeLevel, this.currentScope);
//     this.currentScope = newScope;
//   }
  
//   /**
//    * Exit current scope and return to parent
//    */
//   exitScope() {
//     if (this.currentScope.parent === null) {
//       throw new Error('Cannot exit global scope');
//     }
//     this.currentScope = this.currentScope.parent;
//     this.scopeLevel--;
//   }
  
//   /**
//    * Declare a new symbol in current scope
//    */
//   declare(name, type, isArray, arraySize, line, column) {
//     // Check if already declared in current scope
//     const existing = this.currentScope.lookup(name);
//     if (existing) {
//       throw new Error(
//         `Variable '${name}' already declared at line ${line}:${column}`
//       );
//     }
    
//     // Calculate memory location
//     let memoryLocation;
//     if (isArray) {
//       // Arrays go in .data section
//       memoryLocation = {
//         section: 'data',
//         offset: this.nextMemoryOffset,
//         size: arraySize * (type === 'int' ? 4 : 1) // bytes
//       };
//       this.nextMemoryOffset += memoryLocation.size;
//     } else {
//       // Simple variables can be in registers or stack
//       memoryLocation = {
//         section: 'register', // Will be assigned by register allocator
//         offset: null,
//         size: type === 'int' ? 4 : 1
//       };
//     }
    
//     const symbol = new Symbol(
//       name,
//       type,
//       isArray,
//       arraySize,
//       this.scopeLevel,
//       memoryLocation
//     );
    
//     this.currentScope.define(name, symbol);
//     return symbol;
//   }
  
//   /**
//    * Lookup symbol in current scope and parent scopes
//    */
//   lookup(name) {
//     let scope = this.currentScope;
    
//     while (scope !== null) {
//       const symbol = scope.lookup(name);
//       if (symbol) {
//         return symbol;
//       }
//       scope = scope.parent;
//     }
    
//     return null;
//   }
  
//   /**
//    * Check if symbol exists (throws error if not)
//    */
//   resolve(name, line, column) {
//     const symbol = this.lookup(name);
//     if (!symbol) {
//       throw new Error(
//         `Undeclared variable '${name}' at line ${line}:${column}`
//       );
//     }
//     return symbol;
//   }
  
//   /**
//    * Mark symbol as initialized
//    */
//   markInitialized(name) {
//     const symbol = this.lookup(name);
//     if (symbol) {
//       symbol.isInitialized = true;
//     }
//   }
  
//   /**
//    * Get all symbols in current scope
//    */
//   getCurrentScopeSymbols() {
//     return this.currentScope.getAllSymbols();
//   }
  
//   /**
//    * Get all symbols in global scope
//    */
//   getGlobalSymbols() {
//     return this.globalScope.getAllSymbols();
//   }
  
//   /**
//    * Get all symbols across all scopes
//    */
//   getAllSymbols() {
//     const symbols = [];
//     let scope = this.currentScope;
    
//     while (scope !== null) {
//       symbols.push(...scope.getAllSymbols());
//       scope = scope.parent;
//     }
    
//     return symbols;
//   }
  
//   /**
//    * Print symbol table (for debugging)
//    */
//   print() {
//     console.log('\n=== Symbol Table ===');
//     console.log('Global Scope:');
//     this.globalScope.getAllSymbols().forEach(sym => {
//       console.log('  ' + sym.toString());
//     });
    
//     if (this.currentScope !== this.globalScope) {
//       console.log(`\nCurrent Scope (Level ${this.scopeLevel}):`);
//       this.currentScope.getAllSymbols().forEach(sym => {
//         console.log('  ' + sym.toString());
//       });
//     }
//     console.log('===================\n');
//   }
  
//   /**
//    * Get symbol table statistics
//    */
//   getStats() {
//     const allSymbols = this.getGlobalSymbols();
//     const arrays = allSymbols.filter(s => s.isArray);
//     const variables = allSymbols.filter(s => !s.isArray);
    
//     return {
//       totalSymbols: allSymbols.length,
//       arrays: arrays.length,
//       variables: variables.length,
//       memoryUsed: this.nextMemoryOffset,
//       scopeLevel: this.scopeLevel
//     };
//   }
  
//   /**
//    * Export symbol table for code generation
//    */
//   export() {
//     return {
//       globals: this.getGlobalSymbols().map(sym => ({
//         name: sym.name,
//         type: sym.type,
//         isArray: sym.isArray,
//         arraySize: sym.arraySize,
//         memoryLocation: sym.memoryLocation,
//         register: sym.register
//       })),
//       stats: this.getStats()
//     };
//   }
// }

// module.exports = { SymbolTable, Symbol, Scope };
// backend/src/compiler/semantic/symbol_table.js

/**
 * Symbol class
 */
class Symbol {
  constructor(name, type, isArray = false, arraySize = null, scope = 'global') {
    this.name = name;
    this.type = type;
    this.isArray = isArray;
    this.arraySize = arraySize;
    this.scope = scope;
    this.offset = null; // Stack offset for local variables
  }
}

/**
 * Function Symbol class
 */
class FunctionSymbol {
  constructor(name, returnType, params = []) {
    this.name = name;
    this.returnType = returnType;
    this.params = params; // Array of {type, name}
    this.isDefined = false;
  }
}

/**
 * Symbol Table for semantic analysis
 */
class SymbolTable {
  constructor() {
    this.scopes = [new Map()]; // Stack of scopes (global is first)
    this.currentScope = 0;
    this.functions = new Map(); // Function definitions
  }
  
  /**
   * Enter a new scope
   */
  enterScope() {
    this.scopes.push(new Map());
    this.currentScope++;
  }
  
  /**
   * Exit current scope
   */
  exitScope() {
    if (this.currentScope > 0) {
      this.scopes.pop();
      this.currentScope--;
    }
  }
  
  /**
   * Define a variable in current scope
   */
  define(name, type, isArray = false, arraySize = null) {
    const scope = this.currentScope === 0 ? 'global' : 'local';
    const symbol = new Symbol(name, type, isArray, arraySize, scope);
    
    // Check if already defined in current scope
    if (this.scopes[this.currentScope].has(name)) {
      throw new Error(`Variable '${name}' already defined in current scope`);
    }
    
    this.scopes[this.currentScope].set(name, symbol);
    return symbol;
  }
  
  /**
   * Define a function
   */
  defineFunction(name, returnType, params = []) {
    if (this.functions.has(name)) {
      throw new Error(`Function '${name}' already defined`);
    }
    
    const funcSymbol = new FunctionSymbol(name, returnType, params);
    funcSymbol.isDefined = true;
    this.functions.set(name, funcSymbol);
    return funcSymbol;
  }
  
  /**
   * Lookup a variable (searches from current scope up to global)
   */
  lookup(name) {
    // Search from current scope to global
    for (let i = this.currentScope; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name);
      }
    }
    
    throw new Error(`Undefined variable '${name}'`);
  }
  
  /**
   * Lookup a function
   */
  lookupFunction(name) {
    if (!this.functions.has(name)) {
      throw new Error(`Undefined function '${name}'`);
    }
    return this.functions.get(name);
  }
  
  /**
   * Check if variable exists in any scope
   */
  exists(name) {
    for (let i = this.currentScope; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if function exists
   */
  functionExists(name) {
    return this.functions.has(name);
  }
  
  /**
   * Get all symbols in current scope
   */
  getCurrentScopeSymbols() {
    return Array.from(this.scopes[this.currentScope].values());
  }
  
  /**
   * Get all global symbols
   */
  getGlobalSymbols() {
    return Array.from(this.scopes[0].values());
  }
  
  /**
   * Get all functions
   */
  getAllFunctions() {
    return Array.from(this.functions.values());
  }
  
  /**
   * Print symbol table (for debugging)
   */
  print() {
    console.log('=== Symbol Table ===');
    console.log('\nFunctions:');
    this.functions.forEach((func, name) => {
      const params = func.params.map(p => `${p.type} ${p.name}`).join(', ');
      console.log(`  ${func.returnType} ${name}(${params})`);
    });
    
    console.log('\nVariables:');
    this.scopes.forEach((scope, level) => {
      const scopeName = level === 0 ? 'global' : `local(${level})`;
      console.log(`\n  Scope: ${scopeName}`);
      scope.forEach((symbol, name) => {
        const arrayInfo = symbol.isArray ? `[${symbol.arraySize}]` : '';
        console.log(`    ${symbol.type} ${name}${arrayInfo}`);
      });
    });
  }
  
  /**
   * Get statistics
   */
  getStats() {
    let totalVars = 0;
    this.scopes.forEach(scope => {
      totalVars += scope.size;
    });
    
    return {
      totalVariables: totalVars,
      globalVariables: this.scopes[0].size,
      totalFunctions: this.functions.size,
      scopeDepth: this.currentScope
    };
  }
}

module.exports = { SymbolTable, Symbol, FunctionSymbol };