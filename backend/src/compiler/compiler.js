

const { Tokenizer } = require('./lexer/tokenizer');
const { Parser } = require('./parser/parser');
const { SemanticAnalyzer } = require('./semantic/semantic_analyzer');
const { MIPSGenerator } = require('./codegen/mips_generator');

class Compiler {
  constructor() {
    this.sourceCode = '';
    this.tokens = [];
    this.ast = null;
    this.symbolTable = null;
    this.mipsCode = '';
    this.errors = [];
    this.warnings = [];
    this.stats = {};
  }

  compile(sourceCode) {
    // Reset state
    this.sourceCode = sourceCode;
    this.errors = [];
    this.warnings = [];
    this.tokens = [];
    this.ast = null;
    this.symbolTable = null;
    this.mipsCode = '';
    this.stats = {};

    try {
      
      // PHASE 1: LEXICAL ANALYSIS
      
      console.log('=== Phase 1: Lexical Analysis ===');
      const lexer = new Tokenizer(sourceCode);
      this.tokens = lexer.tokenize();
      console.log(`✓ Tokens generated: ${this.tokens.length}`);
      
      if (this.tokens.length === 0) {
        throw new Error('No tokens generated - empty source code');
      }

      
      // PHASE 2: SYNTAX ANALYSIS (PARSING)
   
      console.log('\n=== Phase 2: Syntax Analysis ===');
      const parser = new Parser(this.tokens);
      this.ast = parser.parse();
      console.log('✓ AST generated successfully');
      
      if (!this.ast) {
        throw new Error('Failed to generate AST');
      }

      
      // PHASE 3: SEMANTIC ANALYSIS
     
      console.log('\n=== Phase 3: Semantic Analysis ===');
      const analyzer = new SemanticAnalyzer();
      const semanticResult = analyzer.analyze(this.ast);
      
      this.symbolTable = semanticResult.symbolTable;
      this.warnings = semanticResult.warnings || [];
      
      console.log('✓ Semantic analysis complete');
      console.log(`  Variables: ${this.symbolTable.variables.size}`);
      console.log(`  Functions: ${this.symbolTable.functions.size}`);
      console.log(`  Warnings: ${this.warnings.length}`);

    
      // PHASE 4: CODE GENERATION
      
      console.log('\n=== Phase 4: Code Generation ===');
      const generator = new MIPSGenerator(this.ast, this.symbolTable);
      this.mipsCode = generator.generate();
      const codeStats = generator.getStats();
      
      console.log('✓ MIPS code generated successfully');
      console.log(`  Total lines: ${codeStats.totalLines}`);
      console.log(`  Labels: ${codeStats.labelsGenerated}`);

    
      // COMPILATION COMPLETE
     
      this.stats = {
        tokens: this.tokens.length,
        functions: this.symbolTable.functions.size,
        variables: this.symbolTable.variables.size,
        codeLines: codeStats.totalLines,
        warnings: this.warnings.length
      };

      console.log('\n COMPILATION SUCCESSFUL\n');

      return {
        success: true,
        mipsCode: this.mipsCode,
        ast: this.ast,
        symbolTable: {
          globals: Array.from(this.symbolTable.variables.values()),
          functions: Array.from(this.symbolTable.functions.values()),
          stats: this.symbolTable.getStats()
        },
        tokens: this.tokens.map(t => ({
          type: t.type,
          value: t.value,
          line: t.line,
          column: t.column
        })),
        warnings: this.warnings,
        stats: this.stats
      };

    } catch (error) {
      console.error('\ COMPILATION FAILED');
      console.error(`Error: ${error.message}\n`);

      const phase = this.determineFailurePhase(error);

      return {
        success: false,
        error: error.message,
        phase: phase,
        line: error.line || null,
        column: error.column || null,
        mipsCode: this.mipsCode || '',
        ast: this.ast,
        symbolTable: this.symbolTable ? {
          globals: Array.from(this.symbolTable.variables.values()),
          functions: Array.from(this.symbolTable.functions.values()),
          stats: this.symbolTable.getStats()
        } : null,
        tokens: this.tokens.map(t => ({
          type: t.type,
          value: t.value,
          line: t.line,
          column: t.column
        })),
        warnings: this.warnings,
        stats: this.stats
      };
    }
  }

  determineFailurePhase(error) {
    const msg = (error.message || '').toLowerCase();
    
    if (msg.includes('unexpected character') || msg.includes('invalid token')) {
      return 'Lexical Analysis';
    }
    if (msg.includes('expected') || msg.includes('unexpected token')) {
      return 'Syntax Analysis';
    }
    if (msg.includes('undefined') || msg.includes('already defined') || msg.includes('type')) {
      return 'Semantic Analysis';
    }
    if (msg.includes('code generation') || msg.includes('register')) {
      return 'Code Generation';
    }
    
    return 'Unknown';
  }

  // Helper method for direct compilation
  static compile(sourceCode) {
    const compiler = new Compiler();
    return compiler.compile(sourceCode);
  }
}

// Export convenience function
function compileToMIPS(sourceCode) {
  return Compiler.compile(sourceCode);
}

module.exports = { Compiler, compileToMIPS };
