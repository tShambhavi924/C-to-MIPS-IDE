// frontend/src/components/Visualization/MemoryViewer.js

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const MemoryViewer = () => {
  const { memory, symbolTable } = useApp();
  const [displayMode, setDisplayMode] = useState('hex'); // 'hex', 'decimal', 'ascii'
  const [searchAddress, setSearchAddress] = useState('');
  
  // Parse memory data
  const memoryEntries = Object.entries(memory).sort((a, b) => {
    const addrA = parseInt(a[0], 16);
    const addrB = parseInt(b[0], 16);
    return addrA - addrB;
  });
  
  // Get data section info from symbol table
  const dataSection = symbolTable?.globals || [];
  
  const formatValue = (value, mode) => {
    const num = typeof value === 'number' ? value : parseInt(value);
    
    switch (mode) {
      case 'hex':
        return '0x' + num.toString(16).toUpperCase().padStart(2, '0');
      case 'decimal':
        return num.toString();
      case 'ascii':
        return num >= 32 && num <= 126 ? String.fromCharCode(num) : '.';
      default:
        return num.toString();
    }
  };
  
  const getSymbolAtAddress = (address) => {
    const addr = parseInt(address, 16);
    for (const symbol of dataSection) {
      if (symbol.memoryLocation?.offset === addr) {
        return symbol.name;
      }
    }
    return null;
  };
  
  const MemoryRow = ({ address, value }) => {
    const symbol = getSymbolAtAddress(address);
    
    return (
      <div className="flex items-center justify-between p-2 border-b border-gray-700 hover:bg-gray-800 transition-colors font-mono text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-blue-400 w-24">{address}</span>
          {symbol && (
            <span className="text-green-400 text-xs px-2 py-1 bg-green-900 bg-opacity-30 rounded">
              {symbol}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white">{formatValue(value, displayMode)}</span>
          <span className="text-gray-400 text-xs">{formatValue(value, 'ascii')}</span>
        </div>
      </div>
    );
  };
  
  const filteredMemory = searchAddress
    ? memoryEntries.filter(([addr]) => addr.toLowerCase().includes(searchAddress.toLowerCase()))
    : memoryEntries;
  
  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-blue-400">Memory View</h2>
        <p className="text-xs text-gray-400 mt-1">Data Segment & Stack</p>
      </div>
      
      {/* Controls */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">Display Mode:</label>
          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="hex">Hexadecimal</option>
            <option value="decimal">Decimal</option>
            <option value="ascii">ASCII</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">Search:</label>
          <input
            type="text"
            placeholder="Enter address (e.g., 0x10000000)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Data Section Variables */}
      {dataSection.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Data Section</h3>
          <div className="space-y-1 text-xs">
            {dataSection.map((symbol, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-blue-400 font-mono">{symbol.name}</span>
                <span className="text-gray-400">
                  {symbol.type}{symbol.isArray ? `[${symbol.arraySize}]` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Memory Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400">Address</span>
              <span className="text-gray-400">Value</span>
            </div>
            
            {filteredMemory.length > 0 ? (
              filteredMemory.map(([address, value]) => (
                <MemoryRow key={address} address={address} value={value} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">
                  {searchAddress ? 'No matching addresses found' : 'No memory data'}
                </p>
                <p className="text-xs mt-1">
                  {!searchAddress && 'Execute the program to see memory contents'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Statistics */}
      {memoryEntries.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Entries: {memoryEntries.length}</span>
            <span>Non-zero bytes: {memoryEntries.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryViewer;