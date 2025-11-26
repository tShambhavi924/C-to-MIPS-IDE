// frontend/src/components/Examples/ExamplesSidebar.js

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const ExamplesSidebar = ({ isOpen, onClose }) => {
  const { loadExample } = useApp();
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      fetchExamples();
    }
  }, [isOpen]);
  
  const fetchExamples = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await axios.get(`${API_BASE_URL}/examples`);
      setExamples(response.data.examples);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadExample = (exampleId) => {
    loadExample(exampleId);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white">Example Programs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleLoadExample(example.id)}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                        {example.title}
                      </h3>
                      <p className="text-sm text-gray-400">{example.description}</p>
                    </div>
                    <ChevronRight
                      className="text-gray-600 group-hover:text-blue-400 transition-colors mt-1"
                      size={20}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-3 p-2 bg-gray-900 rounded border border-gray-700">
                    <pre className="text-xs text-gray-400 font-mono overflow-hidden line-clamp-3">
                      {example.code.split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExamplesSidebar;