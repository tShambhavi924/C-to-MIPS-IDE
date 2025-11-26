// frontend/src/components/Editor/CodeEditor.js

import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../../context/AppContext';

const CodeEditor = ({ language, value, onChange, readOnly = false }) => {
  const editorRef = useRef(null);
  const { highlightedLine } = useApp();
  
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Custom C language configuration
    if (language === 'c') {
      monaco.languages.setLanguageConfiguration('c', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] }
        ]
      });
    }
    
    // MIPS syntax highlighting
    if (language === 'mips') {
      monaco.languages.register({ id: 'mips' });
      
      monaco.languages.setMonarchTokensProvider('mips', {
        keywords: [
          'add', 'addi', 'sub', 'mul', 'div', 'mflo', 'mfhi',
          'and', 'or', 'xor', 'nor', 'slt', 'sltu',
          'sll', 'srl', 'sra', 'sllv', 'srlv',
          'lw', 'lb', 'sw', 'sb', 'la', 'li', 'move',
          'beq', 'bne', 'j', 'jal', 'jr',
          'syscall'
        ],
        registers: [
          '$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3',
          '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7',
          '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7',
          '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'
        ],
        directives: ['.data', '.text', '.word', '.space', '.byte', '.asciiz', '.globl'],
        
        tokenizer: {
          root: [
            [/#.*$/, 'comment'],
            [/[a-zA-Z_]\w*:/, 'type.identifier'],
            [/\$\w+/, { cases: { '@registers': 'variable.predefined', '@default': 'variable' } }],
            [/\.[a-z]+/, { cases: { '@directives': 'keyword', '@default': 'keyword' } }],
            [/[a-z]+/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
            [/-?\d+/, 'number'],
            [/0x[0-9a-fA-F]+/, 'number.hex'],
            [/".*?"/, 'string'],
            [/[,()]/, 'delimiter']
          ]
        }
      });
      
      monaco.languages.setLanguageConfiguration('mips', {
        comments: { lineComment: '#' }
      });
    }
  };
  
  // Highlight specific line
  useEffect(() => {
    if (editorRef.current && highlightedLine) {
      const editor = editorRef.current;
      editor.revealLineInCenter(highlightedLine);
      editor.deltaDecorations([], [
        {
          range: new window.monaco.Range(highlightedLine, 1, highlightedLine, 1),
          options: {
            isWholeLine: true,
            className: 'highlighted-line',
            glyphMarginClassName: 'highlighted-line-glyph'
          }
        }
      ]);
    }
  }, [highlightedLine]);
  
  const options = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: readOnly,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    theme: 'vs-dark'
  };
  
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={options}
      theme="vs-dark"
    />
  );
};

export default CodeEditor;