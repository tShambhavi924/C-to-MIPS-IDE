// frontend/src/components/Visualization/RegisterViewer.js

import React from 'react';
import { useApp } from '../../context/AppContext';

const RegisterViewer = () => {
  const { registers } = useApp();
  
  // Register groups for organized display
  const registerGroups = [
    {
      name: 'Special Registers',
      registers: ['$zero', '$sp', '$ra', '$gp', '$fp']
    },
    {
      name: 'Return Values',
      registers: ['$v0', '$v1']
    },
    {
      name: 'Arguments',
      registers: ['$a0', '$a1', '$a2', '$a3']
    },
    {
      name: 'Temporary Registers',
      registers: ['$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$t8', '$t9']
    },
    {
      name: 'Saved Registers',
      registers: ['$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7']
    }
  ];
  
  const formatValue = (value) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'number' ? value : parseInt(value);
    return {
      decimal: num.toString(),
      hex: '0x' + num.toString(16).toUpperCase().padStart(8, '0'),
      binary: '0b' + num.toString(2).padStart(32, '0')
    };
  };
  
  const RegisterRow = ({ name, value }) => {
    const formatted = formatValue(value);
    const isChanged = value !== 0 && value !== undefined;
    
    return (
      <div className={`flex items-center justify-between p-2 border-b border-gray-700 hover:bg-gray-800 transition-colors ${isChanged ? 'bg-green-900 bg-opacity-20' : ''}`}>
        <div className="flex items-center space-x-3 flex-1">
          <span className="font-mono text-blue-400 w-16">{name}</span>
          <div className="flex flex-col space-y-1 flex-1">
            <div className="flex items-center space-x-4">
              <span className="text-white font-mono text-sm">{formatted.decimal}</span>
              <span className="text-gray-400 font-mono text-xs">{formatted.hex}</span>
            </div>
          </div>
        </div>
        {isChanged && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full bg-gray-900 text-white overflow-auto">
      <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <h2 className="text-lg font-bold text-blue-400">Register File</h2>
        <p className="text-xs text-gray-400 mt-1">32 MIPS Registers</p>
      </div>
      
      <div className="p-4 space-y-4">
        {registerGroups.map((group, idx) => (
          <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300">{group.name}</h3>
            </div>
            <div>
              {group.registers.map(reg => (
                <RegisterRow
                  key={reg}
                  name={reg}
                  value={registers[reg]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(registers).length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-sm">No execution data</p>
            <p className="text-xs mt-1">Run the program to see register values</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterViewer;