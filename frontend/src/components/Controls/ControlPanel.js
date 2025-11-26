// // frontend/src/components/Controls/ControlPanel.js

// import React from 'react';
// import { Play, Pause, SkipForward, RotateCcw, Zap, Code } from 'lucide-react';
// import { useApp } from '../../context/AppContext';

// const ControlPanel = () => {
//   const {
//     isCompiling,
//     isExecuting,
//     isStepMode,
//     setIsStepMode,
//     compileCode,
//     executeCode,
//     stepExecution,
//     resetExecution,
//     executionResult,
//     currentStep
//   } = useApp();
  
//   const Button = ({ onClick, disabled, icon: Icon, children, variant = 'primary', className = '' }) => {
//     const baseClass = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    
//     const variants = {
//       primary: "bg-blue-600 hover:bg-blue-700 text-white",
//       success: "bg-green-600 hover:bg-green-700 text-white",
//       warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
//       danger: "bg-red-600 hover:bg-red-700 text-white",
//       secondary: "bg-gray-700 hover:bg-gray-600 text-white"
//     };
    
//     return (
//       <button
//         onClick={onClick}
//         disabled={disabled}
//         className={`${baseClass} ${variants[variant]} ${className}`}
//       >
//         {Icon && <Icon size={18} />}
//         <span>{children}</span>
//       </button>
//     );
//   };
  
//   return (
//     <div className="bg-gray-800 border-b border-gray-700 p-4">
//       <div className="flex items-center justify-between">
//         {/* Left side - Compilation & Execution */}
//         <div className="flex items-center space-x-3">
//           <Button
//             onClick={compileCode}
//             disabled={isCompiling}
//             icon={Code}
//             variant="primary"
//           >
//             {isCompiling ? 'Compiling...' : 'Compile'}
//           </Button>
          
//           <div className="w-px h-8 bg-gray-700"></div>
          
//           <Button
//             onClick={executeCode}
//             disabled={isExecuting || isStepMode}
//             icon={Play}
//             variant="success"
//           >
//             Run
//           </Button>
          
//           <Button
//             onClick={() => {
//               setIsStepMode(true);
//               stepExecution();
//             }}
//             disabled={isExecuting || isStepMode}
//             icon={SkipForward}
//             variant="warning"
//           >
//             Step
//           </Button>
          
//           {isStepMode && (
//             <Button
//               onClick={stepExecution}
//               disabled={isExecuting || executionResult?.completed}
//               icon={SkipForward}
//               variant="warning"
//             >
//               Next Step
//             </Button>
//           )}
          
//           <Button
//             onClick={resetExecution}
//             disabled={isExecuting}
//             icon={RotateCcw}
//             variant="secondary"
//           >
//             Reset
//           </Button>
//         </div>
        
//         {/* Right side - Status */}
//         <div className="flex items-center space-x-4">
//           {isStepMode && (
//             <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-700">
//               <Pause size={16} className="text-yellow-400" />
//               <span className="text-sm text-yellow-400 font-medium">
//                 Step Mode: {currentStep}
//               </span>
//             </div>
//           )}
          
//           {executionResult && (
//             <div className="flex items-center space-x-2 px-4 py-2 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
//               <Zap size={16} className="text-green-400" />
//               <span className="text-sm text-green-400 font-medium">
//                 Executed: {executionResult.instructionsExecuted || 0} instructions
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* Output Console */}
//       {executionResult?.output && (
//         <div className="mt-4 border border-gray-700 rounded-lg bg-gray-900">
//           <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
//             <h3 className="text-sm font-semibold text-gray-300">Program Output</h3>
//           </div>
//           <div className="p-3">
//             <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
//               {executionResult.output || '(no output)'}
//             </pre>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ControlPanel;
// frontend/src/components/Controls/ControlPanel.js

import React from "react";
import { Play, RotateCcw, Code } from "lucide-react";
import { useApp } from "../../context/AppContext";

const ControlPanel = () => {
  const {
    isCompiling,
    isExecuting,
    compileCode,
    executeCode,
    resetExecution,
    executionResult,
  } = useApp();

  const Button = ({ onClick, disabled, icon: Icon, children, variant = "primary", className = "" }) => {
    const baseClass =
      "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClass} ${variants[variant]} ${className}`}
      >
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </button>
    );
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left side buttons */}
        <div className="flex items-center space-x-3">
          <Button onClick={compileCode} disabled={isCompiling} icon={Code} variant="primary">
            {isCompiling ? "Compiling..." : "Compile"}
          </Button>

          <div className="w-px h-8 bg-gray-700"></div>

          <Button onClick={executeCode} disabled={isExecuting} icon={Play} variant="success">
            Run
          </Button>

          <Button onClick={resetExecution} disabled={isExecuting} icon={RotateCcw} variant="secondary">
            Reset
          </Button>
        </div>

        {/* Right side result status */}
        {executionResult && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
            <span className="text-sm text-green-400 font-medium">
              Executed Successfully
            </span>
          </div>
        )}
      </div>

      {/* Output Console */}
      {executionResult?.output && (
        <div className="mt-4 border border-gray-700 rounded-lg bg-gray-900">
          <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
            <h3 className="text-sm font-semibold text-gray-300">Program Output</h3>
          </div>
          <div className="p-3">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {executionResult.output || "(no output)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
