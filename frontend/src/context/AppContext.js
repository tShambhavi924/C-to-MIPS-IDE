import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const AppProvider = ({ children }) => {
  // Code state
  const [cCode, setCCode] = useState('');
  const [mipsCode, setMipsCode] = useState('');
  
  // Compilation state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const [compilationWarnings, setCompilationWarnings] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [symbolTable, setSymbolTable] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [registers, setRegisters] = useState({});
  const [memory, setMemory] = useState({});
  
  // Step execution state
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [executionTrace, setExecutionTrace] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'visualization', 'help'
  const [showTokens, setShowTokens] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  
  /**
   * Compile C code to MIPS
   */
  const compileCode = useCallback(async () => {
    if (!cCode.trim()) {
      setCompilationError('Please enter some C code to compile');
      return;
    }
    
    setIsCompiling(true);
    setCompilationError(null);
    setCompilationWarnings([]);
    setMipsCode('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/compile`, {
        code: cCode
      });
      
      if (response.data.success) {
        setMipsCode(response.data.mipsCode);
        setTokens(response.data.tokens || []);
        setSymbolTable(response.data.symbolTable);
        setStats(response.data.stats);
        setCompilationWarnings(response.data.warnings || []);
        setCompilationError(null);
      } else {
        setCompilationError(response.data.error);
        setMipsCode('');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      if (error.response?.data?.error) {
        setCompilationError(error.response.data.error);
      } else {
        setCompilationError('Failed to connect to compiler server');
      }
    } finally {
      setIsCompiling(false);
    }
  }, [cCode]);
  
  /**
   * Execute MIPS code
   */
  const executeCode = useCallback(async () => {
    if (!mipsCode.trim()) {
      setExecutionError('No MIPS code to execute. Please compile first.');
      return;
    }
    
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        mipsCode: mipsCode,
        inputData: ''
      });
      
      if (response.data.success) {
        setExecutionResult(response.data);
        setRegisters(response.data.registers || {});
        setMemory(response.data.memory || {});
        setExecutionTrace(response.data.trace || []);
        setExecutionError(null);
      } else {
        setExecutionError(response.data.error);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setExecutionError(error.response?.data?.error || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  }, [mipsCode]);
  
  /**
   * Execute one step
   */
  const stepExecution = useCallback(async () => {
    if (!mipsCode.trim()) {
      setExecutionError('No MIPS code to execute');
      return;
    }
    
    setIsExecuting(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/execute/step`, {
        mipsCode: mipsCode,
        currentStep: currentStep
      });
      
      if (response.data.success) {
        setRegisters(response.data.registers || {});
        setMemory(response.data.memory || {});
        setCurrentStep(currentStep + 1);
        setExecutionResult(response.data);
        
        if (response.data.completed) {
          setIsStepMode(false);
          setCurrentStep(0);
        }
      } else {
        setExecutionError(response.data.error);
      }
    } catch (error) {
      console.error('Step execution error:', error);
      setExecutionError(error.response?.data?.error || 'Step execution failed');
    } finally {
      setIsExecuting(false);
    }
  }, [mipsCode, currentStep]);
  
  /**
   * Reset execution state
   */
  const resetExecution = useCallback(() => {
    setIsStepMode(false);
    setCurrentStep(0);
    setExecutionResult(null);
    setExecutionError(null);
    setRegisters({});
    setMemory({});
    setExecutionTrace([]);
    setHighlightedLine(null);
  }, []);
  
  /**
   * Load example code
   */
  const loadExample = useCallback(async (exampleId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/examples`);
      const example = response.data.examples.find(ex => ex.id === exampleId);
      
      if (example) {
        setCCode(example.code);
        setMipsCode('');
        resetExecution();
        setCompilationError(null);
        setCompilationWarnings([]);
      }
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  }, [resetExecution]);
  
  /**
   * Clear all
   */
  const clearAll = useCallback(() => {
    setCCode('');
    setMipsCode('');
    resetExecution();
    setCompilationError(null);
    setCompilationWarnings([]);
    setTokens([]);
    setSymbolTable(null);
    setStats(null);
  }, [resetExecution]);
  
  const value = {
    // Code state
    cCode,
    setCCode,
    mipsCode,
    setMipsCode,
    
    // Compilation
    isCompiling,
    compilationError,
    compilationWarnings,
    tokens,
    symbolTable,
    stats,
    compileCode,
    
    // Execution
    isExecuting,
    executionResult,
    executionError,
    registers,
    memory,
    executeCode,
    
    // Step execution
    isStepMode,
    setIsStepMode,
    currentStep,
    executionTrace,
    stepExecution,
    resetExecution,
    
    // UI state
    activeTab,
    setActiveTab,
    showTokens,
    setShowTokens,
    showSymbols,
    setShowSymbols,
    highlightedLine,
    setHighlightedLine,
    
    // Actions
    loadExample,
    clearAll
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};