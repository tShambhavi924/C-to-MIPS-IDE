// backend/src/server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Compiler } = require('./compiler/compiler');
const { executeMIPS } = require('./execution/executor');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please try again later.'
});

// Apply rate limiting to compile endpoint
app.use('/api/compile', limiter);
app.use('/api/execute', limiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Compile C code to MIPS
 * POST /api/compile
 * Body: { code: string }
 */
app.post('/api/compile', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Validation
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: code is required'
      });
    }
    
    // Check code length (max 5000 characters)
    if (code.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Code too long (max 5000 characters)'
      });
    }
    
    // Compile
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    if (result.success) {
      res.json({
        success: true,
        mipsCode: result.mipsCode,
        tokens: result.tokens,
        symbolTable: result.symbolTable,
        warnings: result.warnings,
        stats: result.stats
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        phase: result.phase,
        tokens: result.tokens,
        warnings: result.warnings
      });
    }
    
  } catch (error) {
    console.error('Compilation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during compilation'
    });
  }
});

/**
 * Execute MIPS code
 * POST /api/execute
 * Body: { mipsCode: string, inputData: string }
 */
app.post('/api/execute', async (req, res) => {
  try {
    const { mipsCode, inputData } = req.body;
    
    // Validation
    if (!mipsCode || typeof mipsCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: mipsCode is required'
      });
    }
    
    // Execute MIPS code
    const executionResult = await executeMIPS(mipsCode, inputData || '');
    
    res.json(executionResult);
    
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during execution',
      details: error.message
    });
  }
});

/**
 * Step-by-step execution
 * POST /api/execute/step
 * Body: { mipsCode: string, currentStep: number }
 */
app.post('/api/execute/step', async (req, res) => {
  try {
    const { mipsCode, currentStep } = req.body;
    
    // Validation
    if (!mipsCode || typeof mipsCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: mipsCode is required'
      });
    }
    
    // Execute one step
    const stepResult = await executeMIPS(mipsCode, '', currentStep || 0, true);
    
    res.json(stepResult);
    
  } catch (error) {
    console.error('Step execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during step execution',
      details: error.message
    });
  }
});

/**
 * Get example programs
 * GET /api/examples
 */
app.get('/api/examples', (req, res) => {
  const examples = [
    {
      id: 'factorial',
      title: 'Factorial',
      description: 'Calculate factorial of a number',
      code: `int n;
int factorial;
int i;

n = 5;
factorial = 1;

for (i = 1; i <= n; i = i + 1) {
  factorial = factorial * i;
}

printf("%d", factorial);`
    },
    {
      id: 'fibonacci',
      title: 'Fibonacci',
      description: 'Generate Fibonacci sequence',
      code: `int n;
int a;
int b;
int temp;
int i;

n = 10;
a = 0;
b = 1;

for (i = 0; i < n; i = i + 1) {
  printf("%d", a);
  temp = a + b;
  a = b;
  b = temp;
}`
    },
    {
      id: 'array_sum',
      title: 'Array Sum',
      description: 'Sum of array elements',
      code: `int arr[5];
int sum;
int i;

arr[0] = 10;
arr[1] = 20;
arr[2] = 30;
arr[3] = 40;
arr[4] = 50;

sum = 0;
for (i = 0; i < 5; i = i + 1) {
  sum = sum + arr[i];
}

printf("%d", sum);`
    },
    {
      id: 'bubble_sort',
      title: 'Bubble Sort',
      description: 'Sort array using bubble sort',
      code: `int arr[5];
int n;
int i;
int j;
int temp;

n = 5;
arr[0] = 64;
arr[1] = 34;
arr[2] = 25;
arr[3] = 12;
arr[4] = 22;

for (i = 0; i < n - 1; i = i + 1) {
  for (j = 0; j < n - i - 1; j = j + 1) {
    if (arr[j] > arr[j + 1]) {
      temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}`
    },
    {
      id: 'max_array',
      title: 'Find Maximum',
      description: 'Find maximum element in array',
      code: `int arr[5];
int max;
int i;

arr[0] = 3;
arr[1] = 7;
arr[2] = 2;
arr[3] = 9;
arr[4] = 5;

max = arr[0];
for (i = 1; i < 5; i = i + 1) {
  if (arr[i] > max) {
    max = arr[i];
  }
}

printf("%d", max);`
    }
  ];
  
  res.json({
    success: true,
    examples: examples
  });
});

/**
 * Validate C code syntax
 * POST /api/validate
 * Body: { code: string }
 */
app.post('/api/validate', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: code is required'
      });
    }
    
    const compiler = new Compiler();
    const result = compiler.compile(code);
    
    res.json({
      valid: result.success,
      errors: result.success ? [] : [result.error],
      warnings: result.warnings || []
    });
    
  } catch (error) {
    res.status(500).json({
      valid: false,
      errors: [error.message],
      warnings: []
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   C-to-MIPS Compiler Backend Server       ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚═══════════════════════════════════════════╝
  `);
  console.log('Server is ready to accept requests.\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;