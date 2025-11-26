// // backend/src/compiler/codegen/register_allocator.js

// /**
//  * MIPS Register Conventions
//  */
// const MIPS_REGISTERS = {
//   // Temporary registers (caller-saved)
//   TEMP: ['$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$t8', '$t9'],
  
//   // Saved registers (callee-saved) - for future use
//   SAVED: ['$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7'],
  
//   // Function argument registers
//   ARG: ['$a0', '$a1', '$a2', '$a3'],
  
//   // Function return value registers
//   RETURN: ['$v0', '$v1'],
  
//   // Special registers
//   ZERO: '$zero',  // Always 0
//   SP: '$sp',      // Stack pointer
//   FP: '$fp',      // Frame pointer
//   RA: '$ra',      // Return address
//   GP: '$gp'       // Global pointer
// };

// /**
//  * Register Allocator using simplified linear scan
//  */
// class RegisterAllocator {
//   constructor() {
//     this.freeRegisters = [...MIPS_REGISTERS.TEMP]; // Start with all temp registers free
//     this.allocatedRegisters = new Map(); // variable name -> register
//     this.registerContents = new Map();   // register -> variable name
//     this.spilledVariables = new Set();   // Variables spilled to memory
//     this.lastUsed = new Map();           // register -> timestamp for LRU
//     this.timestamp = 0;
//   }
  
//   /**
//    * Allocate a register for a variable
//    */
//   allocate(variableName) {
//     // Check if already allocated
//     if (this.allocatedRegisters.has(variableName)) {
//       const reg = this.allocatedRegisters.get(variableName);
//       this.lastUsed.set(reg, this.timestamp++);
//       return reg;
//     }
    
//     // If free registers available
//     if (this.freeRegisters.length > 0) {
//       const reg = this.freeRegisters.shift(); // Take first free register
//       this.allocatedRegisters.set(variableName, reg);
//       this.registerContents.set(reg, variableName);
//       this.lastUsed.set(reg, this.timestamp++);
//       return reg;
//     }
    
//     // No free registers - need to spill (LRU strategy)
//     const victimReg = this.findLRURegister();
//     const victimVar = this.registerContents.get(victimReg);
    
//     // Mark victim as spilled
//     this.spilledVariables.add(victimVar);
//     this.allocatedRegisters.delete(victimVar);
    
//     // Allocate register to new variable
//     this.allocatedRegisters.set(variableName, victimReg);
//     this.registerContents.set(victimReg, variableName);
//     this.lastUsed.set(victimReg, this.timestamp++);
    
//     return {
//       register: victimReg,
//       spilledVariable: victimVar,
//       needsSpill: true
//     };
//   }
  
//   /**
//    * Allocate a temporary register (not tied to a variable)
//    */
//   allocateTemp() {
//     if (this.freeRegisters.length > 0) {
//       const reg = this.freeRegisters.shift();
//       this.lastUsed.set(reg, this.timestamp++);
//       return reg;
//     }
    
//     // Use LRU if no free registers
//     const reg = this.findLRURegister();
//     this.lastUsed.set(reg, this.timestamp++);
//     return reg;
//   }
  
//   /**
//    * Free a register (make it available again)
//    */
//   free(register) {
//     if (this.registerContents.has(register)) {
//       const variable = this.registerContents.get(register);
//       this.allocatedRegisters.delete(variable);
//       this.registerContents.delete(register);
//     }
    
//     if (!this.freeRegisters.includes(register)) {
//       this.freeRegisters.push(register);
//     }
//   }
  
//   /**
//    * Get register for variable (returns null if not allocated)
//    */
//   getRegister(variableName) {
//     return this.allocatedRegisters.get(variableName) || null;
//   }
  
//   /**
//    * Check if variable is currently in a register
//    */
//   isInRegister(variableName) {
//     return this.allocatedRegisters.has(variableName);
//   }
  
//   /**
//    * Check if variable was spilled to memory
//    */
//   isSpilled(variableName) {
//     return this.spilledVariables.has(variableName);
//   }
  
//   /**
//    * Find least recently used register for eviction
//    */
//   findLRURegister() {
//     let lruReg = null;
//     let lruTime = Infinity;
    
//     for (const [reg, time] of this.lastUsed.entries()) {
//       if (MIPS_REGISTERS.TEMP.includes(reg)) {
//         if (time < lruTime) {
//           lruTime = time;
//           lruReg = reg;
//         }
//       }
//     }
    
//     return lruReg || MIPS_REGISTERS.TEMP[0];
//   }
  
//   /**
//    * Save all allocated registers to stack (for function calls)
//    */
//   saveAllRegisters() {
//     const instructions = [];
//     let stackOffset = 0;
    
//     for (const [variable, register] of this.allocatedRegisters.entries()) {
//       instructions.push(`    sw    ${register}, ${stackOffset}($sp)    # Save ${variable}`);
//       stackOffset += 4;
//     }
    
//     if (stackOffset > 0) {
//       instructions.unshift(`    addi  $sp, $sp, -${stackOffset}    # Allocate stack space`);
//       instructions.push(`    addi  $sp, $sp, ${stackOffset}     # Restore stack pointer`);
//     }
    
//     return instructions;
//   }
  
//   /**
//    * Restore all registers from stack
//    */
//   restoreAllRegisters() {
//     const instructions = [];
//     let stackOffset = 0;
    
//     for (const [variable, register] of this.allocatedRegisters.entries()) {
//       instructions.push(`    lw    ${register}, ${stackOffset}($sp)    # Restore ${variable}`);
//       stackOffset += 4;
//     }
    
//     return instructions;
//   }
  
//   /**
//    * Get spill location on stack for a variable
//    */
//   getSpillLocation(variableName) {
//     // Calculate stack offset based on spill order
//     const spilledArray = Array.from(this.spilledVariables);
//     const index = spilledArray.indexOf(variableName);
    
//     if (index === -1) {
//       return null;
//     }
    
//     // Each spilled variable takes 4 bytes
//     return -(index + 1) * 4; // Negative offset from $fp
//   }
  
//   /**
//    * Reset allocator (for new function/scope)
//    */
//   reset() {
//     this.freeRegisters = [...MIPS_REGISTERS.TEMP];
//     this.allocatedRegisters.clear();
//     this.registerContents.clear();
//     this.spilledVariables.clear();
//     this.lastUsed.clear();
//     this.timestamp = 0;
//   }
  
//   /**
//    * Get allocation statistics
//    */
//   getStats() {
//     return {
//       allocatedCount: this.allocatedRegisters.size,
//       freeCount: this.freeRegisters.length,
//       spilledCount: this.spilledVariables.size,
//       utilizationPercent: (this.allocatedRegisters.size / MIPS_REGISTERS.TEMP.length) * 100
//     };
//   }
  
//   /**
//    * Print current allocation state (for debugging)
//    */
//   print() {
//     console.log('\n=== Register Allocation ===');
//     console.log('Allocated:');
//     for (const [variable, register] of this.allocatedRegisters.entries()) {
//       console.log(`  ${variable} -> ${register}`);
//     }
//     console.log(`Free: ${this.freeRegisters.join(', ')}`);
//     console.log(`Spilled: ${Array.from(this.spilledVariables).join(', ')}`);
//     console.log('==========================\n');
//   }
  
//   /**
//    * Export allocation state
//    */
//   export() {
//     return {
//       allocated: Object.fromEntries(this.allocatedRegisters),
//       free: [...this.freeRegisters],
//       spilled: Array.from(this.spilledVariables),
//       stats: this.getStats()
//     };
//   }
// }

// module.exports = { RegisterAllocator, MIPS_REGISTERS };
// backend/src/compiler/codegen/register_allocator.js

class RegisterAllocator {
  constructor() {
    // Temporary registers $t0-$t9
    this.tempRegisters = [
      '$t0', '$t1', '$t2', '$t3', '$t4',
      '$t5', '$t6', '$t7', '$t8', '$t9'
    ];
    
    // Saved registers $s0-$s7 (if needed)
    this.savedRegisters = [
      '$s0', '$s1', '$s2', '$s3',
      '$s4', '$s5', '$s6', '$s7'
    ];
    
    this.currentTemp = 0;
    this.currentSaved = 0;
    this.usageCount = 0;
  }

  allocateTemp() {
    const reg = this.tempRegisters[this.currentTemp];
    this.currentTemp = (this.currentTemp + 1) % this.tempRegisters.length;
    this.usageCount++;
    return reg;
  }

  allocateSaved() {
    const reg = this.savedRegisters[this.currentSaved];
    this.currentSaved = (this.currentSaved + 1) % this.savedRegisters.length;
    return reg;
  }

  reset() {
    this.currentTemp = 0;
    this.currentSaved = 0;
  }

  getStats() {
    return {
      totalAllocations: this.usageCount,
      tempRegistersAvailable: this.tempRegisters.length,
      savedRegistersAvailable: this.savedRegisters.length
    };
  }
}

module.exports = { RegisterAllocator };