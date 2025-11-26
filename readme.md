# C-to-MIPS Integrated Development Environment

A comprehensive educational platform for learning compiler design and computer architecture through C-to-MIPS translation and simulation.

## Features

- **Complete C Compiler**: Lexical analysis, parsing, semantic analysis, and MIPS code generation
- **Real-time Visualization**: Register and memory state tracking during execution
- **Step-by-step Debugging**: Execute MIPS instructions one at a time
- **Educational Examples**: Pre-built programs covering common algorithms
- **Interactive UI**: Split-pane editor with syntax highlighting for C and MIPS

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd c-to-mips-ide
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1)
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3001`

2. **Start the frontend** (Terminal 2)
```bash
cd frontend
npm start
```

The application will open in your browser at `http://localhost:3000`

## Usage

1. **Write C Code**: Enter your C program in the left editor panel
2. **Compile**: Click the "Compile" button to generate MIPS assembly
3. **Execute**: Click "Run" to execute the MIPS code completely, or "Step" for step-by-step execution
4. **Visualize**: Watch register and memory values update in real-time
5. **Debug**: Use the step execution mode to trace through each instruction

## Supported C Features

### Phase 1 Support:
- Data types: `int`, `char`, 1D arrays
- Operators: Arithmetic (`+`, `-`, `*`, `/`, `%`), Relational (`<`, `>`, `==`, `!=`, `<=`, `>=`), Logical (`&&`, `||`, `!`), Bitwise (`&`, `|`, `^`, `<<`, `>>`)
- Control structures: `if-else`, `for`, `while`, `do-while`
- I/O: `printf()`, `scanf()`

## Project Structure

```
c-to-mips-ide/
├── backend/
│   ├── src/
│   │   ├── compiler/
│   │   │   ├── lexer/           # Tokenization
│   │   │   ├── parser/          # AST generation
│   │   │   ├── semantic/        # Type checking & symbol table
│   │   │   └── codegen/         # MIPS code generation
│   │   ├── execution/           # MIPS simulator
│   │   └── server.js            # Express API server
│   └── tests/                   # Unit & integration tests
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/          # Code editor (Monaco)
│   │   │   ├── Visualization/   # Register/memory viewers
│   │   │   ├── Controls/        # Execution controls
│   │   │   └── Examples/        # Example programs
│   │   ├── context/             # React Context (state management)
│   │   └── App.js               # Main application
│   └── public/
│
└── docs/                        # Documentation
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Run Specific Test Suite
```bash
npm test -- lexer.test.js
npm test -- compiler.test.js
```

## API Documentation

### Endpoints

#### `POST /api/compile`
Compile C code to MIPS assembly
- **Body**: `{ code: string }`
- **Response**: `{ success: boolean, mipsCode: string, tokens: [], symbolTable: {}, warnings: [] }`

#### `POST /api/execute`
Execute MIPS code
- **Body**: `{ mipsCode: string, inputData: string }`
- **Response**: `{ success: boolean, output: string, registers: {}, memory: {} }`

#### `POST /api/execute/step`
Execute one instruction
- **Body**: `{ mipsCode: string, currentStep: number }`
- **Response**: `{ success: boolean, registers: {}, memory: {}, pc: number, completed: boolean }`

#### `GET /api/examples`
Get example programs
- **Response**: `{ success: boolean, examples: [] }`

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start  # Runs with hot reload
```

### Linting
```bash
cd backend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- Monaco Editor for code editing
- Express.js for backend API
- React for frontend UI
- Tailwind CSS for styling


