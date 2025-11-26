// backend/src/execution/executor.js

/**
 * Simple MIPS Interpreter for executing generated assembly
 */
class MIPSSimulator {
  constructor() {
    this.reset();
  }
  
  reset() {
    // Registers (32 total)
    this.registers = new Array(32).fill(0);
    this.registers[29] = 0x7FFFFFFC; // $sp (stack pointer)
    
    // Register names mapping
    this.regMap = {
      '$zero': 0, '$at': 1,
      '$v0': 2, '$v1': 3,
      '$a0': 4, '$a1': 5, '$a2': 6, '$a3': 7,
      '$t0': 8, '$t1': 9, '$t2': 10, '$t3': 11,
      '$t4': 12, '$t5': 13, '$t6': 14, '$t7': 15,
      '$s0': 16, '$s1': 17, '$s2': 18, '$s3': 19,
      '$s4': 20, '$s5': 21, '$s6': 22, '$s7': 23,
      '$t8': 24, '$t9': 25,
      '$k0': 26, '$k1': 27,
      '$gp': 28, '$sp': 29, '$fp': 30, '$ra': 31
    };
    
    // Memory - Use object for sparse addressing
    this.memory = {};
    this.dataSegment = {}; // label -> address mapping
    
    // Program counter
    this.pc = 0;
    this.instructions = [];
    
    // Execution state
    this.running = false;
    this.output = [];
    this.executedInstructions = 0;
    this.maxInstructions = 10000; // Prevent infinite loops
    
    // LO and HI registers for multiplication/division
    this.lo = 0;
    this.hi = 0;
    
    // Execution trace
    this.trace = [];
  }
  
  /**
   * Load MIPS assembly code
   */
  load(mipsCode) {
    this.reset();
    
    const lines = mipsCode.split('\n').map(l => l.trim());
    let section = null;
    let dataAddress = 0x10000000;
    
    for (let line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || line === '') continue;
      
      // Section directives
      if (line === '.data') {
        section = 'data';
        continue;
      }
      if (line === '.text') {
        section = 'text';
        continue;
      }
      if (line === '.globl main' || line.startsWith('.globl')) continue;
      
      // Data section
      if (section === 'data') {
        if (line.includes(':')) {
          const [label, directive] = line.split(':').map(s => s.trim());
          
          if (directive.startsWith('.word')) {
            this.dataSegment[label] = dataAddress;
            // Initialize with 0
            this.storeWord(dataAddress, 0);
            dataAddress += 4;
          } else if (directive.startsWith('.space')) {
            const size = parseInt(directive.split(' ')[1]);
            this.dataSegment[label] = dataAddress;
            // Initialize space with zeros
            for (let i = 0; i < size; i++) {
              this.memory[dataAddress + i] = 0;
            }
            dataAddress += size;
          } else if (directive.startsWith('.byte')) {
            this.dataSegment[label] = dataAddress;
            this.storeByte(dataAddress, 0);
            dataAddress += 1;
          } else if (directive.startsWith('.asciiz')) {
            this.dataSegment[label] = dataAddress;
            const match = directive.match(/"(.*)"/);
            if (match) {
              const str = match[1];
              // Handle escape sequences
              const processedStr = str.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
              for (let i = 0; i < processedStr.length; i++) {
                this.storeByte(dataAddress + i, processedStr.charCodeAt(i));
              }
              this.storeByte(dataAddress + processedStr.length, 0); // null terminator
              dataAddress += processedStr.length + 1;
            }
          }
        }
      }
      
      // Text section
      if (section === 'text') {
        if (line.endsWith(':')) {
          // Label
          const label = line.slice(0, -1);
          this.instructions.push({ type: 'label', label: label, pc: this.instructions.length });
        } else {
          // Instruction
          this.instructions.push({ type: 'instruction', code: line, pc: this.instructions.length });
        }
      }
    }
  }
  
  /**
   * Execute all instructions
   */
  execute(inputData = '') {
    this.running = true;
    this.output = [];
    this.executedInstructions = 0;
    
    while (this.running && this.pc < this.instructions.length) {
      if (this.executedInstructions >= this.maxInstructions) {
        throw new Error('Execution limit exceeded (possible infinite loop)');
      }
      
      this.step();
      this.executedInstructions++;
    }
    
    return {
      success: true,
      output: this.output.join(''),
      registers: this.getRegisterState(),
      memory: this.getMemoryState(),
      instructionsExecuted: this.executedInstructions,
      trace: this.trace
    };
  }
  
  /**
   * Execute one instruction (for step-by-step execution)
   */
  step() {
    if (this.pc >= this.instructions.length) {
      this.running = false;
      return;
    }
    
    const instr = this.instructions[this.pc];
    
    if (instr.type === 'label') {
      this.pc++;
      return this.step();
    }
    
    // Parse and execute instruction
    const code = instr.code;
    this.executeInstruction(code);
    
    // Record trace
    this.trace.push({
      pc: this.pc,
      instruction: code,
      registers: { ...this.getRegisterState() }
    });
    
    this.pc++;
  }
  
  /**
   * Execute a single instruction
   */
  executeInstruction(code) {
    // Remove comments
    code = code.split('#')[0].trim();
    if (!code) return;
    
    // Parse instruction - handle different formats
    const parts = this.parseInstruction(code);
    const op = parts[0];
    
    try {
      switch (op) {
        // Arithmetic
        case 'add':
          this.setReg(parts[1], this.getReg(parts[2]) + this.getReg(parts[3]));
          break;
        case 'addi':
          this.setReg(parts[1], this.getReg(parts[2]) + parseInt(parts[3]));
          break;
        case 'sub':
          this.setReg(parts[1], this.getReg(parts[2]) - this.getReg(parts[3]));
          break;
        case 'mul':
          this.setReg(parts[1], this.getReg(parts[2]) * this.getReg(parts[3]));
          break;
        case 'div':
          // MIPS div: quotient in LO, remainder in HI
          const dividend = this.getReg(parts[1]);
          const divisor = this.getReg(parts[2]);
          if (divisor !== 0) {
            this.lo = Math.floor(dividend / divisor);
            this.hi = dividend % divisor;
          }
          break;
        case 'mflo':
          this.setReg(parts[1], this.lo || 0);
          break;
        case 'mfhi':
          this.setReg(parts[1], this.hi || 0);
          break;
        
        // Logical
        case 'and':
          this.setReg(parts[1], this.getReg(parts[2]) & this.getReg(parts[3]));
          break;
        case 'or':
          this.setReg(parts[1], this.getReg(parts[2]) | this.getReg(parts[3]));
          break;
        case 'xor':
          this.setReg(parts[1], this.getReg(parts[2]) ^ this.getReg(parts[3]));
          break;
        case 'xori':
          this.setReg(parts[1], this.getReg(parts[2]) ^ parseInt(parts[3]));
          break;
        case 'slt':
          this.setReg(parts[1], this.getReg(parts[2]) < this.getReg(parts[3]) ? 1 : 0);
          break;
        case 'sltu':
          this.setReg(parts[1], (this.getReg(parts[2]) >>> 0) < (this.getReg(parts[3]) >>> 0) ? 1 : 0);
          break;
        case 'sltiu':
          this.setReg(parts[1], (this.getReg(parts[2]) >>> 0) < parseInt(parts[3]) ? 1 : 0);
          break;
        
        // Shift
        case 'sll':
          this.setReg(parts[1], this.getReg(parts[2]) << parseInt(parts[3]));
          break;
        case 'sllv':
          this.setReg(parts[1], this.getReg(parts[2]) << this.getReg(parts[3]));
          break;
        case 'srl':
          this.setReg(parts[1], this.getReg(parts[2]) >>> parseInt(parts[3]));
          break;
        case 'srlv':
          this.setReg(parts[1], this.getReg(parts[2]) >>> this.getReg(parts[3]));
          break;
        
        // Load/Store
        case 'lw':
          const lwAddr = this.parseMemoryOperand(parts[2]);
          this.setReg(parts[1], this.loadWord(lwAddr));
          break;
        case 'lb':
          const lbAddr = this.parseMemoryOperand(parts[2]);
          this.setReg(parts[1], this.loadByte(lbAddr));
          break;
        case 'sw':
          const swAddr = this.parseMemoryOperand(parts[2]);
          this.storeWord(swAddr, this.getReg(parts[1]));
          break;
        case 'sb':
          const sbAddr = this.parseMemoryOperand(parts[2]);
          this.storeByte(sbAddr, this.getReg(parts[1]));
          break;
        case 'la':
          // Load address
          if (this.dataSegment[parts[2]]) {
            this.setReg(parts[1], this.dataSegment[parts[2]]);
          } else {
            this.setReg(parts[1], 0);
          }
          break;
        case 'li':
          this.setReg(parts[1], parseInt(parts[2]));
          break;
        case 'move':
          this.setReg(parts[1], this.getReg(parts[2]));
          break;
        
        // Branch/Jump
        case 'beq':
          if (this.getReg(parts[1]) === this.getReg(parts[2])) {
            this.pc = this.findLabel(parts[3]) - 1;
          }
          break;
        case 'bne':
          if (this.getReg(parts[1]) !== this.getReg(parts[2])) {
            this.pc = this.findLabel(parts[3]) - 1;
          }
          break;
        case 'j':
          this.pc = this.findLabel(parts[1]) - 1;
          break;
        case 'jal':
          this.setReg('$ra', this.pc + 1);
          this.pc = this.findLabel(parts[1]) - 1;
          break;
        case 'jr':
          this.pc = this.getReg(parts[1]) - 1;
          break;
        
        // Syscalls
        case 'syscall':
          this.handleSyscall();
          break;
        
        default:
          // Unknown instruction, skip
          console.warn(`Unknown instruction: ${op}`);
          break;
      }
    } catch (error) {
      throw new Error(`Error executing '${code}': ${error.message}`);
    }
  }
  
  /**
   * Parse instruction into parts, handling different formats
   */
  parseInstruction(code) {
    // Handle memory operands like "0($t0)" specially
    const memPattern = /(\w+)\s+(\$\w+),\s*(-?\d+)\((\$\w+)\)/;
    const memMatch = code.match(memPattern);
    
    if (memMatch) {
      // lw $t1, 0($t0) -> ['lw', '$t1', '0($t0)']
      return [memMatch[1], memMatch[2], `${memMatch[3]}(${memMatch[4]})`];
    }
    
    // Regular instruction parsing
    return code.split(/[\s,]+/).filter(p => p);
  }
  
  /**
   * Parse memory operand like "0($t0)" or "label"
   */
  parseMemoryOperand(operand) {
    // Format: offset($register)
    const match = operand.match(/(-?\d+)\((\$\w+)\)/);
    if (match) {
      const offset = parseInt(match[1]);
      const baseReg = match[2];
      return this.getReg(baseReg) + offset;
    }
    
    // Format: label
    if (this.dataSegment[operand]) {
      return this.dataSegment[operand];
    }
    
    return 0;
  }
  
  /**
   * Handle MIPS syscalls
   */
  handleSyscall() {
    const syscallCode = this.registers[2]; // $v0
    
    switch (syscallCode) {
      case 1: // Print integer
        this.output.push(this.registers[4].toString()); // $a0
        break;
      case 4: // Print string
        const strAddr = this.registers[4];
        let str = '';
        let addr = strAddr;
        let maxChars = 1000; // Prevent infinite loop
        while (maxChars-- > 0) {
          const byte = this.loadByte(addr);
          if (byte === 0) break;
          str += String.fromCharCode(byte);
          addr++;
        }
        this.output.push(str);
        break;
      case 5: // Read integer
        // For now, return 0 (would need input handling)
        this.registers[2] = 0;
        break;
      case 10: // Exit
        this.running = false;
        break;
      case 11: // Print character
        this.output.push(String.fromCharCode(this.registers[4]));
        break;
      case 12: // Read character
        this.registers[2] = 0;
        break;
      default:
        console.warn(`Unknown syscall code: ${syscallCode}`);
        break;
    }
  }
  
  /**
   * Find label position
   */
  findLabel(label) {
    for (let i = 0; i < this.instructions.length; i++) {
      if (this.instructions[i].type === 'label' && this.instructions[i].label === label) {
        return i;
      }
    }
    throw new Error(`Label '${label}' not found`);
  }
  
  /**
   * Get register value by name
   */
  getReg(name) {
    const index = this.regMap[name];
    if (index === undefined) {
      throw new Error(`Unknown register: ${name}`);
    }
    return this.registers[index];
  }
  
  /**
   * Set register value by name
   */
  setReg(name, value) {
    const index = this.regMap[name];
    if (index === undefined) {
      throw new Error(`Unknown register: ${name}`);
    }
    if (index === 0) return; // $zero is always 0
    
    // Convert to 32-bit signed integer
    this.registers[index] = value | 0;
  }
  
  /**
   * Load word from memory (4 bytes, little-endian)
   */
  loadWord(address) {
    return (this.memory[address] || 0) |
           ((this.memory[address + 1] || 0) << 8) |
           ((this.memory[address + 2] || 0) << 16) |
           ((this.memory[address + 3] || 0) << 24);
  }
  
  /**
   * Store word to memory (4 bytes, little-endian)
   */
  storeWord(address, value) {
    this.memory[address] = value & 0xFF;
    this.memory[address + 1] = (value >> 8) & 0xFF;
    this.memory[address + 2] = (value >> 16) & 0xFF;
    this.memory[address + 3] = (value >> 24) & 0xFF;
  }
  
  /**
   * Load byte from memory
   */
  loadByte(address) {
    return this.memory[address] || 0;
  }
  
  /**
   * Store byte to memory
   */
  storeByte(address, value) {
    this.memory[address] = value & 0xFF;
  }
  
  /**
   * Get current register state
   */
  getRegisterState() {
    const state = {};
    for (const [name, index] of Object.entries(this.regMap)) {
      state[name] = this.registers[index];
    }
    return state;
  }
  
  /**
   * Get memory state (only non-zero values)
   */
  getMemoryState() {
    const state = {};
    for (const [addr, value] of Object.entries(this.memory)) {
      if (value !== 0) {
        const addrNum = parseInt(addr);
        state[`0x${addrNum.toString(16)}`] = value;
      }
    }
    return state;
  }
}

/**
 * Execute MIPS code (main export function)
 */
async function executeMIPS(mipsCode, inputData = '', currentStep = null, stepMode = false) {
  const simulator = new MIPSSimulator();
  
  try {
    simulator.load(mipsCode);
    
    if (stepMode && currentStep !== null) {
      // Step-by-step execution
      simulator.running = true;
      for (let i = 0; i <= currentStep; i++) {
        if (!simulator.running) break;
        simulator.step();
      }
      
      return {
        success: true,
        currentStep: currentStep,
        registers: simulator.getRegisterState(),
        memory: simulator.getMemoryState(),
        output: simulator.output.join(''),
        pc: simulator.pc,
        currentInstruction: simulator.pc < simulator.instructions.length 
          ? simulator.instructions[simulator.pc].code 
          : null,
        completed: !simulator.running
      };
    } else {
      // Full execution
      const result = simulator.execute(inputData);
      return result;
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: simulator.output.join(''),
      registers: simulator.getRegisterState()
    };
  }
}

module.exports = { executeMIPS, MIPSSimulator };