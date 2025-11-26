// frontend/src/App.js

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import CodeEditor from './components/Editor/CodeEditor';
import RegisterViewer from './components/Visualization/RegisterViewer';
import MemoryViewer from './components/Visualization/MemoryViewer';
import ControlPanel from './components/Controls/ControlPanel';
import ExamplesSidebar from './components/Examples/ExamplesSidebar';
import { 
  Code, 
  FileCode, 
  AlertCircle, 
  Info, 
  BookOpen, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AppContent = () => {
  const {
    cCode,
    setCCode,
    mipsCode,
    compilationError,
    compilationWarnings,
    executionError,
    showTokens,
    setShowTokens,
    showSymbols,
    setShowSymbols,
    tokens,
    symbolTable,
    clearAll
  } = useApp();
  
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Code className="text-blue-400" size={28} />
              <div>
                <h1 className="text-xl font-bold">C-to-MIPS IDE</h1>
                <p className="text-xs text-gray-400">Educational Compiler & Simulator</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTokens(!showTokens)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showTokens ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Info size={16} />
              <span className="text-sm">Tokens</span>
            </button>
            
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showSymbols ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Settings size={16} />
              <span className="text-sm">Symbols</span>
            </button>
            
            <button
              onClick={() => setExamplesOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <BookOpen size={16} />
              <span className="text-sm">Examples</span>
            </button>
            
            <button
              onClick={clearAll}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm"
            >
              Clear All
            </button>
          </div>
        </div>
      </header>
      
      {/* Control Panel */}
      <ControlPanel />
      
      {/* Error/Warning Messages */}
      {(compilationError || executionError || compilationWarnings.length > 0) && (
        <div className="px-6 py-3 bg-gray-800 border-b border-gray-700 space-y-2">
          {compilationError && (
            <div className="flex items-start space-x-2 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-red-400">Compilation Error</p>
                <p className="text-sm text-red-300 mt-1">{compilationError}</p>
              </div>
            </div>
          )}
          
          {executionError && (
            <div className="flex items-start space-x-2 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-red-400">Execution Error</p>
                <p className="text-sm text-red-300 mt-1">{executionError}</p>
              </div>
            </div>
          )}
          
          {compilationWarnings.length > 0 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
              <Info className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-yellow-400">
                  Warnings ({compilationWarnings.length})
                </p>
                {compilationWarnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-yellow-300 mt-1">• {warning}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - C Code Editor */}
        <div className={`flex flex-col border-r border-gray-700 transition-all duration-300 ${
          leftPanelCollapsed ? 'w-12' : 'w-1/2'
        }`}>
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            {!leftPanelCollapsed && (
              <div className="flex items-center space-x-2">
                <FileCode className="text-blue-400" size={18} />
                <span className="font-semibold text-sm">C Source Code</span>
              </div>
            )}
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="ml-auto p-1 hover:bg-gray-700 rounded transition-colors"
            >
              {leftPanelCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          
          {!leftPanelCollapsed && (
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                language="c"
                value={cCode}
                onChange={setCCode}
              />
            </div>
          )}
        </div>
        
        {/* Center Panel - MIPS Code */}
        <div className="flex-1 flex flex-col border-r border-gray-700">
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Code className="text-green-400" size={18} />
              <span className="font-semibold text-sm">MIPS Assembly</span>
            </div>
            {mipsCode && (
              <span className="text-xs text-gray-400">
                {mipsCode.split('\n').length} lines
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden">
            {mipsCode ? (
              <CodeEditor
                language="mips"
                value={mipsCode}
                onChange={() => {}}
                readOnly={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Code className="mx-auto mb-3 opacity-50" size={48} />
                  <p className="text-sm">No MIPS code generated</p>
                  <p className="text-xs mt-1">Write C code and click Compile</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className={`flex flex-col transition-all duration-300 ${
          rightPanelCollapsed ? 'w-12' : 'w-1/3'
        }`}>
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              {rightPanelCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            {!rightPanelCollapsed && (
              <span className="font-semibold text-sm">Execution View</span>
            )}
          </div>
          
          {!rightPanelCollapsed && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto">
                <RegisterViewer />
              </div>
              <div className="flex-1 overflow-auto border-t border-gray-700">
                <MemoryViewer />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Token/Symbol Info Panel */}
      {(showTokens || showSymbols) && (
        <div className="border-t border-gray-700 bg-gray-800 h-48 overflow-auto">
          <div className="p-4">
            {showTokens && tokens.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-blue-400">Tokens ({tokens.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {tokens.slice(0, 50).map((token, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 bg-gray-700 rounded text-xs font-mono"
                      title={`${token.type} at ${token.line}:${token.column}`}
                    >
                      <span className="text-yellow-400">{token.type}</span>
                      {token.value && (
                        <span className="text-gray-300">: {token.value}</span>
                      )}
                    </div>
                  ))}
                  {tokens.length > 50 && (
                    <div className="px-2 py-1 text-xs text-gray-400">
                      ...and {tokens.length - 50} more
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showSymbols && symbolTable?.globals && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-green-400">
                  Symbol Table ({symbolTable.globals.length})
                </h3>
                <div className="space-y-1">
                  {symbolTable.globals.map((symbol, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs font-mono"
                    >
                      <span className="text-white">{symbol.name}</span>
                      <span className="text-gray-400">
                        {symbol.type}{symbol.isArray ? `[${symbol.arraySize}]` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Examples Sidebar */}
      <ExamplesSidebar
        isOpen={examplesOpen}
        onClose={() => setExamplesOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;