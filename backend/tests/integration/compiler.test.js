// // backend/tests/integration/compiler.test.js

// const { Compiler } = require('../../src/compiler/compiler');

// describe('Compiler Integration Tests', () => {
  
//   // Test 1: Simple variable declaration and assignment
//   test('should compile simple variable assignment', () => {
//     const code = `
//       int x;
//       x = 5;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('.data');
//     expect(result.mipsCode).toContain('x: .word');
//     expect(result.mipsCode).toContain('li');
//     expect(result.mipsCode).toContain('sw');
//   });
  
//   // Test 2: Arithmetic expression
//   test('should compile arithmetic expressions', () => {
//     const code = `
//       int a;
//       int b;
//       int sum;
//       a = 10;
//       b = 20;
//       sum = a + b;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('add');
//     expect(result.stats.symbols.totalSymbols).toBe(3);
//   });
  
//   // Test 3: If-else statement
//   test('should compile if-else statements', () => {
//     const code = `
//       int x;
//       int max;
//       x = 5;
//       if (x > 0) {
//         max = x;
//       } else {
//         max = 0;
//       }
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('slt');
//     expect(result.mipsCode).toContain('beq');
//     expect(result.mipsCode).toContain('else_');
//     expect(result.mipsCode).toContain('endif_');
//   });
  
//   // Test 4: For loop
//   test('should compile for loops', () => {
//     const code = `
//       int i;
//       int sum;
//       sum = 0;
//       for (i = 0; i < 10; i = i + 1) {
//         sum = sum + i;
//       }
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('loop_start_');
//     expect(result.mipsCode).toContain('loop_end_');
//     expect(result.mipsCode).toMatch(/j\s+loop_start/);
//   });
  
//   // Test 5: While loop
//   test('should compile while loops', () => {
//     const code = `
//       int count;
//       count = 0;
//       while (count < 5) {
//         count = count + 1;
//       }
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('while_start_');
//     expect(result.mipsCode).toContain('while_end_');
//   });
  
//   // Test 6: Do-while loop
//   test('should compile do-while loops', () => {
//     const code = `
//       int x;
//       x = 0;
//       do {
//         x = x + 1;
//       } while (x < 5);
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('do_start_');
//     expect(result.mipsCode).toContain('bne');
//   });
  
//   // Test 7: Array declaration and access
//   test('should compile array operations', () => {
//     const code = `
//       int arr[5];
//       int i;
//       arr[0] = 10;
//       arr[1] = 20;
//       i = arr[0];
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('arr: .space 20');
//     expect(result.mipsCode).toContain('la');
//     expect(result.mipsCode).toContain('sll');
//   });
  
//   // Test 8: Complex expression with precedence
//   test('should handle operator precedence correctly', () => {
//     const code = `
//       int result;
//       result = 2 + 3 * 4;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     // Should have mul before add (due to precedence)
//     const mulIndex = result.mipsCode.indexOf('mul');
//     const addIndex = result.mipsCode.indexOf('add');
//     expect(mulIndex).toBeLessThan(addIndex);
//   });
  
//   // Test 9: Relational operators
//   test('should compile relational operators', () => {
//     const code = `
//       int a;
//       int b;
//       int result;
//       a = 5;
//       b = 3;
//       result = a > b;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('slt');
//   });
  
//   // Test 10: Logical operators
//   test('should compile logical operators', () => {
//     const code = `
//       int a;
//       int b;
//       int result;
//       a = 1;
//       b = 0;
//       result = a && b;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('and');
//   });
  
//   // Test 11: Printf statement
//   test('should compile printf statements', () => {
//     const code = `
//       int x;
//       x = 42;
//       printf("%d", x);
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('li    $v0, 1');
//     expect(result.mipsCode).toContain('syscall');
//   });
  
//   // Test 12: Scanf statement
//   test('should compile scanf statements', () => {
//     const code = `
//       int x;
//       scanf("%d", &x);
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('li    $v0, 5');
//     expect(result.mipsCode).toContain('syscall');
//   });
  
//   // Test 13: Nested control structures
//   test('should compile nested loops and conditionals', () => {
//     const code = `
//       int i;
//       int j;
//       for (i = 0; i < 3; i = i + 1) {
//         if (i > 1) {
//           j = i;
//         }
//       }
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('loop_start_');
//     expect(result.mipsCode).toContain('endif_');
//   });
  
//   // Test 14: Compound assignment operators
//   test('should compile compound assignments', () => {
//     const code = `
//       int x;
//       x = 10;
//       x += 5;
//       x -= 2;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('add');
//     expect(result.mipsCode).toContain('sub');
//   });
  
//   // Test 15: Increment/Decrement operators
//   test('should compile increment and decrement', () => {
//     const code = `
//       int count;
//       count = 0;
//       count++;
//       count--;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('addi');
//   });
  
//   // Test 16: Error - Undeclared variable
//   test('should catch undeclared variable error', () => {
//     const code = `
//       x = 5;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(false);
//     expect(result.error).toContain('Undeclared variable');
//   });
  
//   // Test 17: Error - Type mismatch warning
//   test('should warn about type mismatches', () => {
//     const code = `
//       int x;
//       char c;
//       c = 'A';
//       x = c;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     // Should have warnings about char to int conversion
//     // This is allowed but generates a warning
//   });
  
//   // Test 18: Error - Syntax error
//   test('should catch syntax errors', () => {
//     const code = `
//       int x
//       x = 5;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(false);
//     expect(result.error).toContain('Expected');
//   });
  
//   // Test 19: Complete program - Factorial
//   test('should compile factorial program', () => {
//     const code = `
//       int n;
//       int factorial;
//       int i;
      
//       n = 5;
//       factorial = 1;
      
//       for (i = 1; i <= n; i = i + 1) {
//         factorial = factorial * i;
//       }
      
//       printf("%d", factorial);
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.stats.declarations).toBe(3);
//     expect(result.mipsCode).toContain('mul');
//   });
  
//   // Test 20: Complete program - Array sum
//   test('should compile array sum program', () => {
//     const code = `
//       int arr[5];
//       int sum;
//       int i;
      
//       sum = 0;
//       arr[0] = 10;
//       arr[1] = 20;
//       arr[2] = 30;
//       arr[3] = 40;
//       arr[4] = 50;
      
//       for (i = 0; i < 5; i = i + 1) {
//         sum = sum + arr[i];
//       }
      
//       printf("%d", sum);
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('arr: .space 20');
//     expect(result.mipsCode).toContain('la');
//     expect(result.mipsCode).toContain('sll');
//   });
  
//   // Test 21: Empty program
//   test('should handle empty program', () => {
//     const code = '';
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('main:');
//   });
  
//   // Test 22: Comments handling
//   test('should ignore comments', () => {
//     const code = `
//       // This is a comment
//       int x; /* Multi-line
//       comment */
//       x = 5;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//   });
  
//   // Test 23: Bitwise operators
//   test('should compile bitwise operations', () => {
//     const code = `
//       int a;
//       int b;
//       int result;
//       a = 5;
//       b = 3;
//       result = a & b;
//       result = a | b;
//       result = a ^ b;
//       result = a << 2;
//       result = a >> 1;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('and');
//     expect(result.mipsCode).toContain('or');
//     expect(result.mipsCode).toContain('xor');
//     expect(result.mipsCode).toContain('sllv');
//     expect(result.mipsCode).toContain('srlv');
//   });
  
//   // Test 24: Character literals
//   test('should handle character literals', () => {
//     const code = `
//       char c;
//       c = 'A';
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toContain('li');
//   });
  
//   // Test 25: Hexadecimal numbers
//   test('should handle hexadecimal literals', () => {
//     const code = `
//       int x;
//       x = 0xFF;
//     `;
    
//     const compiler = new Compiler();
//     const result = compiler.compile(code);
    
//     expect(result.success).toBe(true);
//     expect(result.mipsCode).toMatch(/li.*255/); // 0xFF = 255
//   });
// });
// backend/tests/integration/compiler.test.js

const { Compiler } = require('../../src/compiler/compiler');

describe('Compiler Integration Tests', () => {
  
  // Test 1: Simple variable declaration and assignment
  test('should compile simple variable assignment', () => {
    const code = `
      int x;
      x = 5;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('.data');
    expect(result.mipsCode).toContain('x: .word');
    expect(result.mipsCode).toContain('li');
    expect(result.mipsCode).toContain('sw');
  });
  
  // Test 2: Arithmetic expression
  test('should compile arithmetic expressions', () => {
    const code = `
      int a;
      int b;
      int sum;
      a = 10;
      b = 20;
      sum = a + b;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('add');
    expect(result.stats.symbols.totalSymbols).toBe(3);
  });
  
  // Test 3: If-else statement
  test('should compile if-else statements', () => {
    const code = `
      int x;
      int max;
      x = 5;
      if (x > 0) {
        max = x;
      } else {
        max = 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('slt');
    expect(result.mipsCode).toContain('beq');
    expect(result.mipsCode).toContain('else_');
    expect(result.mipsCode).toContain('endif_');
  });
  
  // Test 4: For loop
  test('should compile for loops', () => {
    const code = `
      int i;
      int sum;
      sum = 0;
      for (i = 0; i < 10; i = i + 1) {
        sum = sum + i;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('loop_start_');
    expect(result.mipsCode).toContain('loop_end_');
    expect(result.mipsCode).toMatch(/j\s+loop_start/);
  });
  
  // Test 5: While loop
  test('should compile while loops', () => {
    const code = `
      int count;
      count = 0;
      while (count < 5) {
        count = count + 1;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('while_start_');
    expect(result.mipsCode).toContain('while_end_');
  });
  
  // Test 6: Do-while loop
  test('should compile do-while loops', () => {
    const code = `
      int x;
      x = 0;
      do {
        x = x + 1;
      } while (x < 5);
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('do_start_');
    expect(result.mipsCode).toContain('bne');
  });
  
  // Test 7: Array declaration and access
  test('should compile array operations', () => {
    const code = `
      int arr[5];
      int i;
      arr[0] = 10;
      arr[1] = 20;
      i = arr[0];
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('arr: .space 20');
    expect(result.mipsCode).toContain('la');
    expect(result.mipsCode).toContain('sll');
  });
  
  // Test 8: Complex expression with precedence
  test('should handle operator precedence correctly', () => {
    const code = `
      int result;
      result = 2 + 3 * 4;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    // Should have mul before add (due to precedence)
    const mulIndex = result.mipsCode.indexOf('mul');
    const addIndex = result.mipsCode.indexOf('add');
    expect(mulIndex).toBeLessThan(addIndex);
  });
  
  // Test 9: Relational operators
  test('should compile relational operators', () => {
    const code = `
      int a;
      int b;
      int result;
      a = 5;
      b = 3;
      result = a > b;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('slt');
  });
  
  // Test 10: Logical operators
  test('should compile logical operators', () => {
    const code = `
      int a;
      int b;
      int result;
      a = 1;
      b = 0;
      result = a && b;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('and');
  });
  
  // Test 11: Printf statement
  test('should compile printf statements', () => {
    const code = `
      int x;
      x = 42;
      printf("%d", x);
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('li    $v0, 1');
    expect(result.mipsCode).toContain('syscall');
  });
  
  // Test 12: Scanf statement
  test('should compile scanf statements', () => {
    const code = `
      int x;
      scanf("%d", &x);
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('li    $v0, 5');
    expect(result.mipsCode).toContain('syscall');
  });
  
  // Test 13: Nested control structures
  test('should compile nested loops and conditionals', () => {
    const code = `
      int i;
      int j;
      for (i = 0; i < 3; i = i + 1) {
        if (i > 1) {
          j = i;
        }
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('loop_start_');
    expect(result.mipsCode).toContain('endif_');
  });
  
  // Test 14: Compound assignment operators
  test('should compile compound assignments', () => {
    const code = `
      int x;
      x = 10;
      x += 5;
      x -= 2;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('add');
    expect(result.mipsCode).toContain('sub');
  });
  
  // Test 15: Increment/Decrement operators
  test('should compile increment and decrement', () => {
    const code = `
      int count;
      count = 0;
      count++;
      count--;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('addi');
  });
  
  // Test 16: Error - Undeclared variable
  test('should catch undeclared variable error', () => {
    const code = `
      x = 5;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Undeclared variable');
  });
  
  // Test 17: Error - Type mismatch warning
  test('should warn about type mismatches', () => {
    const code = `
      int x;
      char c;
      c = 'A';
      x = c;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    // Should have warnings about char to int conversion
    // This is allowed but generates a warning
  });
  
  // Test 18: Error - Syntax error
  test('should catch syntax errors', () => {
    const code = `
      int x
      x = 5;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Expected');
  });
  
  // Test 19: Complete program - Factorial
  test('should compile factorial program', () => {
    const code = `
      int n;
      int factorial;
      int i;
      
      n = 5;
      factorial = 1;
      
      for (i = 1; i <= n; i = i + 1) {
        factorial = factorial * i;
      }
      
      printf("%d", factorial);
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.stats.declarations).toBe(3);
    expect(result.mipsCode).toContain('mul');
  });
  
  // Test 20: Complete program - Array sum
  test('should compile array sum program', () => {
    const code = `
      int arr[5];
      int sum;
      int i;
      
      sum = 0;
      arr[0] = 10;
      arr[1] = 20;
      arr[2] = 30;
      arr[3] = 40;
      arr[4] = 50;
      
      for (i = 0; i < 5; i = i + 1) {
        sum = sum + arr[i];
      }
      
      printf("%d", sum);
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('arr: .space 20');
    expect(result.mipsCode).toContain('la');
    expect(result.mipsCode).toContain('sll');
  });
  
  // Test 21: Empty program
  test('should handle empty program', () => {
    const code = '';
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('main:');
  });
  
  // Test 22: Comments handling
  test('should ignore comments', () => {
    const code = `
      // This is a comment
      int x; /* Multi-line
      comment */
      x = 5;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
  });
  
  // Test 23: Bitwise operators
  test('should compile bitwise operations', () => {
    const code = `
      int a;
      int b;
      int result;
      a = 5;
      b = 3;
      result = a & b;
      result = a | b;
      result = a ^ b;
      result = a << 2;
      result = a >> 1;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('and');
    expect(result.mipsCode).toContain('or');
    expect(result.mipsCode).toContain('xor');
    expect(result.mipsCode).toContain('sllv');
    expect(result.mipsCode).toContain('srlv');
  });
  
  // Test 24: Character literals
  test('should handle character literals', () => {
    const code = `
      char c;
      c = 'A';
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('li');
  });
  
  // Test 25: Hexadecimal numbers
  test('should handle hexadecimal literals', () => {
    const code = `
      int x;
      x = 0xFF;
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toMatch(/li.*255/); // 0xFF = 255
  });

  // NEW TESTS FOR FUNCTION SUPPORT

  // Test 26: Recursive Factorial Function
  test('should compile recursive factorial function', () => {
    const code = `
      int factorial(int n) {
        if (n <= 1) {
          return 1;
        }
        return n * factorial(n - 1);
      }
      int main() {
        int num;
        scanf("%d", &num);
        int result = factorial(num);
        printf("%d", result);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('factorial:');
    expect(result.mipsCode).toContain('main:');
    expect(result.mipsCode).toContain('jal');
    expect(result.mipsCode).toContain('jr    $ra');
  });

  // Test 27: Calculator Functions (add, subtract, multiply, divide)
  test('should compile multiple arithmetic functions', () => {
    const code = `
      int add(int a, int b) {
        return a + b;
      }
      int subtract(int a, int b) {
        return a - b;
      }
      int multiply(int a, int b) {
        return a * b;
      }
      int divide(int a, int b) {
        if (b != 0) {
          return a / b;
        }
        return 0;
      }
      int main() {
        int x = 10;
        int y = 5;
        
        int sum = add(x, y);
        int diff = subtract(x, y);
        int prod = multiply(x, y);
        int quot = divide(x, y);
        
        printf("%d", sum);
        printf("%d", diff);
        printf("%d", prod);
        printf("%d", quot);
        
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('add:');
    expect(result.mipsCode).toContain('subtract:');
    expect(result.mipsCode).toContain('multiply:');
    expect(result.mipsCode).toContain('divide:');
    expect(result.mipsCode).toMatch(/div/);
  });

  // Test 28: Nested Function Calls (square and sumOfSquares)
  test('should compile nested function calls', () => {
    const code = `
      int square(int n) {
        return n * n;
      }
      int sumOfSquares(int a, int b) {
        return square(a) + square(b);
      }
      int main() {
        int x = 3;
        int y = 4;
        int result = sumOfSquares(x, y);
        printf("%d", result);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('square:');
    expect(result.mipsCode).toContain('sumOfSquares:');
    // Should have nested jal instructions
    const jalMatches = result.mipsCode.match(/jal/g);
    expect(jalMatches.length).toBeGreaterThan(2);
  });

  // Test 29: Boolean Helper Functions (isEven, isOdd)
  test('should compile boolean helper functions', () => {
    const code = `
      int isEven(int n) {
        return n % 2 == 0;
      }
      int isOdd(int n) {
        return !isEven(n);
      }
      int main() {
        int num = 10;
        if (isEven(num)) {
          printf("%d", 1);
        }
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('isEven:');
    expect(result.mipsCode).toContain('isOdd:');
    expect(result.mipsCode).toMatch(/rem|div/); // modulo operation
  });

  // Test 30: Power Function with Loop
  test('should compile power function with iterative logic', () => {
    const code = `
      int power(int base, int exp) {
        if (exp == 0) {
          return 1;
        }
        int result = 1;
        int i;
        for (i = 0; i < exp; i = i + 1) {
          result = result * base;
        }
        return result;
      }
      int main() {
        int num = 10;
        int squared = power(num, 2);
        printf("%d", squared);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('power:');
    expect(result.mipsCode).toContain('loop_start_');
    expect(result.mipsCode).toContain('mul');
  });

  // Test 31: Recursive Fibonacci Function
  test('should compile recursive fibonacci function', () => {
    const code = `
      int fibonacci(int n) {
        if (n <= 1) {
          return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      int main() {
        int fib = fibonacci(7);
        printf("%d", fib);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('fibonacci:');
    // Should have multiple recursive calls
    const jalMatches = result.mipsCode.match(/jal.*fibonacci/g);
    expect(jalMatches).toBeTruthy();
  });

  // Test 32: Function with Multiple Parameters
  test('should handle functions with multiple parameters', () => {
    const code = `
      int calculate(int a, int b, int c) {
        return a + b * c;
      }
      int main() {
        int result = calculate(2, 3, 4);
        printf("%d", result);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('calculate:');
    // Should properly handle parameter passing
    expect(result.mipsCode).toMatch(/\$a0|\$a1|\$a2/);
  });

  // Test 33: Function Return Value Usage
  test('should properly use function return values', () => {
    const code = `
      int getValue() {
        return 42;
      }
      int main() {
        int x = getValue();
        int y = getValue() + 10;
        printf("%d", y);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('getValue:');
    expect(result.mipsCode).toMatch(/\$v0/); // return value register
  });

  // Test 34: Function with Local Variables
  test('should handle functions with local variables', () => {
    const code = `
      int compute(int x) {
        int temp = x * 2;
        int result = temp + 5;
        return result;
      }
      int main() {
        int val = compute(10);
        printf("%d", val);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('compute:');
    // Should manage stack frame for local variables
    expect(result.mipsCode).toMatch(/\$sp/); // stack pointer usage
  });

  // Test 35: Complex Program with Multiple Functions
  test('should compile complex program with multiple interacting functions', () => {
    const code = `
      int isEven(int n) {
        return n % 2 == 0;
      }
      int power(int base, int exp) {
        if (exp == 0) {
          return 1;
        }
        int result = 1;
        int i;
        for (i = 0; i < exp; i = i + 1) {
          result = result * base;
        }
        return result;
      }
      int fibonacci(int n) {
        if (n <= 1) {
          return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      int main() {
        int num = 10;
        
        if (isEven(num)) {
          printf("%d", 1);
        }
        
        int squared = power(num, 2);
        printf("%d", squared);
        
        int fib = fibonacci(7);
        printf("%d", fib);
        
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('isEven:');
    expect(result.mipsCode).toContain('power:');
    expect(result.mipsCode).toContain('fibonacci:');
    expect(result.mipsCode).toContain('main:');
  });

  // Test 36: Function with Early Return
  test('should handle functions with multiple return statements', () => {
    const code = `
      int max(int a, int b) {
        if (a > b) {
          return a;
        }
        return b;
      }
      int main() {
        int result = max(10, 20);
        printf("%d", result);
        return 0;
      }
    `;
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    expect(result.success).toBe(true);
    expect(result.mipsCode).toContain('max:');
    expect(result.mipsCode).toContain('jr    $ra');
  });
});