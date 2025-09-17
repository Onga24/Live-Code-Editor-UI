// import React, { useState, useEffect, useRef } from 'react';

// const FileTextIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     className="h-5 w-5"
//   >
//     <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//     <polyline points="14 2 14 8 20 8" />
//   </svg>
// );

// // Enhanced language detection with more file types
// const getLanguageFromExtension = (filename) => {
//   const extension = filename.split('.').pop()?.toLowerCase();
//   const languageMap = {
//     // Web Technologies
//     'html': 'html',
//     'htm': 'html',
//     'css': 'css',
//     'scss': 'scss',
//     'sass': 'sass',
//     'less': 'less',
//     'js': 'javascript',
//     'jsx': 'javascript',
//     'ts': 'typescript',
//     'tsx': 'typescript',
//     'json': 'json',
//     'xml': 'xml',

//     // Programming Languages
//     'py': 'python',
//     'php': 'php',
//     'java': 'java',
//     'c': 'c',
//     'cpp': 'cpp',
//     'cs': 'csharp',
//     'go': 'go',
//     'rs': 'rust',
//     'rb': 'ruby',
//     'swift': 'swift',
//     'kt': 'kotlin',
//     'scala': 'scala',

//     // Shell & Config
//     'sh': 'shell',
//     'bash': 'shell',
//     'yml': 'yaml',
//     'yaml': 'yaml',
//     'toml': 'toml',
//     'ini': 'ini',
//     'conf': 'ini',

//     // Markup & Documentation
//     'md': 'markdown',
//     'markdown': 'markdown',
//     'tex': 'latex',

//     // Database
//     'sql': 'sql',

//     // Other
//     'txt': 'plaintext',
//     'log': 'plaintext'
//   };

//   return languageMap[extension] || 'plaintext';
// };

// // Get default content based on file extension
// const getDefaultContent = (filename) => {
//   const extension = filename.split('.').pop()?.toLowerCase();

//   const templates = {
//     'html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
//     'css': '/* Add your styles here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
//     'js': '// JavaScript code\nconsole.log("Hello World!");',
//     'py': '# Python code\nprint("Hello World!")',
//     'php': '<?php\n// PHP code\necho "Hello World!";\n?>',
//     'md': '# Markdown Document\n\nWrite your content here...',
//     'json': '{\n    "name": "example",\n    "version": "1.0.0"\n}'
//   };

//   return templates[extension] || '';
// };

// function CodeEditor() {
//   const initialProject = {
//     id: 'proj1',
//     title: 'Collaborative App',
//     files: [
//       { 
//         id: 'file1', 
//         name: 'index.html', 
//         content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Hello World</title>\n    <style>\n        body { \n            font-family: Arial, sans-serif; \n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            color: white;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            min-height: 100vh;\n            margin: 0;\n        }\n        .container {\n            text-align: center;\n            background: rgba(255, 255, 255, 0.1);\n            padding: 2rem;\n            border-radius: 15px;\n            backdrop-filter: blur(10px);\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>🚀 Welcome to the Code Editor!</h1>\n        <p>This is a live HTML preview. Try editing the code!</p>\n        <button onclick="alert(\'Hello from JavaScript!\')" style="padding: 10px 20px; border: none; border-radius: 5px; background: #4CAF50; color: white; cursor: pointer;">Click Me!</button>\n    </div>\n</body>\n</html>' 
//       },
//     ]
//   };

//   const [project, setProject] = useState(initialProject);
//   const [activeFileId, setActiveFileId] = useState(initialProject.files[0].id);
//   const [status, setStatus] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [isAddingFile, setIsAddingFile] = useState(false);
//   const [newFileName, setNewFileName] = useState('');
//   const [newFileExtension, setNewFileExtension] = useState('html');
//   const [monacoLoaded, setMonacoLoaded] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(true); // Track dark mode

//   const activeFile = project.files.find(f => f.id === activeFileId);
//   const editorRef = useRef(null);
//   const monacoEditorRef = useRef(null);
//   const monacoInstanceRef = useRef(null);
//   const contentChangeTimeoutRef = useRef(null);

//   // Load Monaco Editor
//   useEffect(() => {
//     if (window.monaco) {
//       monacoInstanceRef.current = window.monaco;
//       setMonacoLoaded(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/loader.js";
//     script.async = true;
//     script.onload = () => {
//       window.require.config({ 
//         paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' } 
//       });
//       window.require(['vs/editor/editor.main'], function(monaco) {
//         monacoInstanceRef.current = monaco;
//         setMonacoLoaded(true);
//       });
//     };
//     document.head.appendChild(script);

//     return () => {
//       if (script.parentNode) {
//         script.parentNode.removeChild(script);
//       }
//     };
//   }, []);

//   // Initialize Monaco Editor only once
//   useEffect(() => {
//     if (!monacoLoaded || !editorRef.current || !monacoInstanceRef.current || monacoEditorRef.current) {
//       return;
//     }
//  const toggleTheme = () => {
//     const newTheme = isDarkMode ? 'vs' : 'vs-dark';
//     setIsDarkMode(!isDarkMode);


//   };
//     // Create editor instance only once
//     const language = getLanguageFromExtension(activeFile.name);
//     monacoEditorRef.current = monacoInstanceRef.current.editor.create(editorRef.current, {
//       value: activeFile.content,
//       language: language,
//       theme:  'vs-dark',
//       automaticLayout: true,
//       minimap: { enabled: true },
//       fontSize: 14,
//       wordWrap: 'on',
//       lineNumbers: 'on',
//       scrollBeyondLastLine: false,
//       folding: true,
//       bracketMatching: 'always',
//       autoIndent: 'full',
//       formatOnPaste: true,
//       formatOnType: true,
//       selectOnLineNumbers: true,
//       roundedSelection: false,
//       readOnly: false,
//       cursorStyle: 'line',
//       mouseWheelZoom: true,
//       contextmenu: true,
//       smoothScrolling: true,
//     });

//     // Handle content changes with debouncing to prevent excessive re-renders
//     const disposable = monacoEditorRef.current.onDidChangeModelContent(() => {
//       // Clear any existing timeout
//       if (contentChangeTimeoutRef.current) {
//         clearTimeout(contentChangeTimeoutRef.current);
//       }

//       // Set new timeout for debounced update
//       contentChangeTimeoutRef.current = setTimeout(() => {
//         if (monacoEditorRef.current) {
//           const newCode = monacoEditorRef.current.getValue();
//           setProject(prevProject => {
//             const newFiles = prevProject.files.map(file =>
//               file.id === activeFileId ? { ...file, content: newCode } : file
//             );
//             return { ...prevProject, files: newFiles };
//           });
//         }
//       }, 100); // 100ms debounce
//     });

//     // Focus the editor after creation
//     setTimeout(() => {
//       if (monacoEditorRef.current) {
//         monacoEditorRef.current.focus();
//       }
//     }, 100);

//     return () => {
//       if (contentChangeTimeoutRef.current) {
//         clearTimeout(contentChangeTimeoutRef.current);
//       }
//       disposable.dispose();
//       if (monacoEditorRef.current) {
//         monacoEditorRef.current.dispose();
//         monacoEditorRef.current = null;
//       }
//     };
//   }, [monacoLoaded]);

//   // Update editor content and language when active file changes
//   useEffect(() => {
//     if (!monacoEditorRef.current || !activeFile) return;

//     const currentValue = monacoEditorRef.current.getValue();
//     const newLanguage = getLanguageFromExtension(activeFile.name);

//     // Only update if content actually changed
//     if (currentValue !== activeFile.content) {
//       // Save cursor position
//       const position = monacoEditorRef.current.getPosition();

//       // Update content without triggering change events temporarily
//       const model = monacoEditorRef.current.getModel();
//       if (model) {
//         model.setValue(activeFile.content);
//       }

//       // Restore cursor position if possible and content allows it
//       if (position && position.lineNumber <= model.getLineCount()) {
//         monacoEditorRef.current.setPosition(position);
//       }
//     }

//     // Update language
//     const model = monacoEditorRef.current.getModel();
//     if (model && monacoInstanceRef.current) {
//       monacoInstanceRef.current.editor.setModelLanguage(model, newLanguage);
//     }

//     // Ensure editor stays focused
//     setTimeout(() => {
//       if (monacoEditorRef.current) {
//         monacoEditorRef.current.focus();
//       }
//     }, 50);
//   }, [activeFileId, activeFile]);

//   // Update preview for HTML files
//   useEffect(() => {
//     if (activeFile && activeFile.name.endsWith('.html')) {
//       updatePreview();
//     } else {
//       clearPreview();
//     }
//   }, [activeFile?.content, activeFileId]);

//   const handleSave = async () => {
//     setIsSaving(true);
//     setStatus('Saving...');

//     // Simulate save operation
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     console.log('Saving project:', project);
//     setStatus('Saved successfully!');
//     setIsSaving(false);
//     setTimeout(() => setStatus(''), 3000);

//     // Return focus to editor after saving
//     setTimeout(() => {
//       if (monacoEditorRef.current) {
//         monacoEditorRef.current.focus();
//       }
//     }, 100);
//   };

//   const handleCreateFile = () => {
//     if (!newFileName.trim()) return;

//     const fullFileName = `${newFileName.trim()}.${newFileExtension}`;
//     const newFile = {
//       id: `file${Date.now()}`, // Use timestamp for unique ID
//       name: fullFileName,
//       content: getDefaultContent(fullFileName),
//     };

//     setProject(prevProject => ({
//       ...prevProject,
//       files: [...prevProject.files, newFile],
//     }));

//     setActiveFileId(newFile.id);
//     setIsAddingFile(false);
//     setNewFileName('');
//     setStatus(`Created ${fullFileName}`);
//     setTimeout(() => setStatus(''), 2000);

//     // Focus editor after creating new file
//     setTimeout(() => {
//       if (monacoEditorRef.current) {
//         monacoEditorRef.current.focus();
//       }
//     }, 200);
//   };

//   const updatePreview = () => {
//     const iframe = document.getElementById('live-preview-iframe');
//     if (!iframe || !activeFile) return;

//     try {
//       const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//       iframeDoc.open();
//       iframeDoc.write(activeFile.content);
//       iframeDoc.close();
//     } catch (error) {
//       console.error('Error updating preview:', error);
//     }
//   };

//   const clearPreview = () => {
//     const iframe = document.getElementById('live-preview-iframe');
//     if (iframe) {
//       try {
//         const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//         iframeDoc.open();
//         iframeDoc.write(`
//           <div style="padding: 20px; font-family: Arial, sans-serif; color: #666; text-align: center; margin-top: 50px;">
//             <h3>📄 Preview Available for HTML Files Only</h3>
//             <p>Switch to an HTML file to see the live preview.</p>
//           </div>
//         `);
//         iframeDoc.close();
//       } catch (error) {
//         console.error('Error clearing preview:', error);
//       }
//     }
//   };

//   const deleteFile = (fileId) => {
//     if (project.files.length <= 1) {
//       setStatus('Cannot delete the last file');
//       setTimeout(() => setStatus(''), 2000);
//       return;
//     }

//     setProject(prevProject => {
//       const newFiles = prevProject.files.filter(file => file.id !== fileId);
//       return { ...prevProject, files: newFiles };
//     });

//     // If we deleted the active file, switch to the first available file
//     if (fileId === activeFileId) {
//       const remainingFiles = project.files.filter(file => file.id !== fileId);
//       setActiveFileId(remainingFiles[0].id);
//     }

//     setStatus('File deleted');
//     setTimeout(() => setStatus(''), 2000);
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 flex flex-col">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
//         <h1 className="text-3xl font-bold text-gray-50">
//           <span className="text-sky-400">Project:</span> {project.title}
//         </h1>
//         <div className="flex items-center space-x-4">
//           <span className={`text-sm px-3 py-1 rounded-full ${
//             status.includes('Saved') ? 'bg-green-900 text-green-200' :
//             status.includes('Created') ? 'bg-blue-900 text-blue-200' :
//             status.includes('deleted') ? 'bg-red-900 text-red-200' :
//             status.includes('Error') ? 'bg-red-900 text-red-200' :
//             'text-gray-400'
//           }`}>
//             {status}
//           </span>
//           <button
//             onClick={handleSave}
//             disabled={isSaving}
//             className={`px-6 py-2 rounded-lg font-semibold transition-all ${
//               isSaving 
//                 ? 'bg-gray-600 cursor-not-allowed' 
//                 : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
//             }`}
//           >
//             {isSaving ? 'Saving...' : 'Save Project'}
//           </button>
//      {/*    */}
//           </div>
//       </div>

//       <div className="flex-1 flex flex-col lg:flex-row gap-6">
//         {/* File Explorer */}
//         <div className="lg:w-1/4 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-50">Files</h3>
//             <button
//               onClick={() => setIsAddingFile(true)}
//               className="px-3 py-1 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-all transform hover:scale-105"
//             >
//               + New File
//             </button>
//           </div>

//           {/* Add File Form */}
//           {isAddingFile && (
//             <div className="flex flex-col space-y-3 mb-4 p-3 bg-gray-700 rounded-lg">
//               <input
//                 type="text"
//                 placeholder="Enter file name"
//                 value={newFileName}
//                 onChange={(e) => setNewFileName(e.target.value)}
//                 className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
//                 onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
//               />
//               <select
//                 value={newFileExtension}
//                 onChange={(e) => setNewFileExtension(e.target.value)}
//                 className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
//               >
//                 <option value="html">.html</option>
//                 <option value="css">.css</option>
//                 <option value="js">.js</option>
//                 <option value="ts">.ts</option>
//                 <option value="jsx">.jsx</option>
//                 <option value="py">.py</option>
//                 <option value="php">.php</option>
//                 <option value="java">.java</option>
//                 <option value="cpp">.cpp</option>
//                 <option value="md">.md</option>
//                 <option value="json">.json</option>
//                 <option value="txt">.txt</option>
//               </select>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={handleCreateFile}
//                   className="flex-1 p-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
//                 >
//                   Create
//                 </button>
//                 <button
//                   onClick={() => {
//                     setIsAddingFile(false);
//                     setNewFileName('');
//                   }}
//                   className="flex-1 p-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* File List */}
//           <ul className="space-y-2">
//             {project.files.map(file => (
//               <li
//                 key={file.id}
//                 className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
//                   file.id === activeFileId 
//                     ? 'bg-sky-600 text-white shadow-lg' 
//                     : 'hover:bg-gray-700'
//                 }`}
//               >
//                 <div
//                   className="flex items-center space-x-2 flex-1"
//                   onClick={() => {
//                     setActiveFileId(file.id);
//                     // Focus editor after file selection
//                     setTimeout(() => {
//                       if (monacoEditorRef.current) {
//                         monacoEditorRef.current.focus();
//                       }
//                     }, 100);
//                   }}
//                 >
//                   <FileTextIcon />
//                   <span className="truncate">{file.name}</span>
//                   <span className="text-xs bg-gray-600 px-2 py-1 rounded">
//                     {getLanguageFromExtension(file.name)}
//                   </span>
//                 </div>
//                 {project.files.length > 1 && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deleteFile(file.id);
//                     }}
//                     className="ml-2 text-red-400 hover:text-red-300 transition-colors"
//                     title="Delete file"
//                   >
//                     ✕
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Editor and Preview */}
//         <div className="flex-1 flex flex-col gap-6">
//           {/* Code Editor */}
//           <div className="flex-1 flex flex-col min-h-0">
//             <div className="flex justify-between items-center mb-3">
//               <label className="text-lg font-semibold text-gray-50">
//                 Code Editor: {activeFile?.name}
//               </label>
//               <span className="text-sm text-gray-400">
//                 Language: {getLanguageFromExtension(activeFile?.name || '')}
//               </span>
//             </div>
//             <div 
//               className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-gray-700"
//               onClick={() => {
//                 // Ensure editor gets focus when container is clicked
//                 if (monacoEditorRef.current) {
//                   monacoEditorRef.current.focus();
//                 }
//               }}
//             >
//               <div ref={editorRef} className="w-full h-full" />
//             </div>
//           </div>

//           {/* Live Preview
//           <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
//             <h3 className="text-lg font-semibold text-gray-50 mb-3">Live Preview</h3>
//             <div className="bg-white rounded-lg overflow-hidden" style={{ height: '300px' }}>
//               <iframe
//                 id="live-preview-iframe"
//                 className="w-full h-full border-none"
//                 title="Live Code Preview"
//                 sandbox="allow-scripts allow-same-origin"
//               />
//             </div>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// }


// export default CodeEditor
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Lightbulb, Bug, Code, Sparkles } from 'lucide-react';
import Chat from './Chat';
import { MessageSquare, X } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAIResponse } from "../lib/aiService";

const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// Enhanced language detection with more file types
const getLanguageFromExtension = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    // Web Technologies
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'xml': 'xml',

    // Programming Languages
    'py': 'python',
    'php': 'php',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',

    // Shell & Config
    'sh': 'shell',
    'bash': 'shell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'ini',

    // Markup & Documentation
    'md': 'markdown',
    'markdown': 'markdown',
    'tex': 'latex',

    // Database
    'sql': 'sql',

    // Other
    'txt': 'plaintext',
    'log': 'plaintext'
  };

  return languageMap[extension] || 'plaintext';
};

// Get default content based on file extension
const getDefaultContent = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();

  const templates = {
    'html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
    'css': '/* Add your styles here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
    'js': '// JavaScript code\nconsole.log("Hello World!");',
    'py': '# Python code\nprint("Hello World!")',
    'php': '<?php\n// PHP code\necho "Hello World!";\n?>',
    'md': '# Markdown Document\n\nWrite your content here...',
    'json': '{\n    "name": "example",\n    "version": "1.0.0"\n}'
  };

  return templates[extension] || '';
};

// open ai
const getDynamicAIResponse = async (message, currentFile, allFiles) => {
  return await getAIResponse(message, currentFile, allFiles);
};

// AI Assistant responses based on code analysis
const getStaticAIResponse = (message, currentFile, allFiles) => {
  const lowerMessage = message.toLowerCase();
  const fileExtension = currentFile?.name.split('.').pop()?.toLowerCase();
  const content = currentFile?.content || '';

  // Quick tips based on file type
  if (lowerMessage.includes('tip') || lowerMessage.includes('hint')) {
    const tips = {
      'html': [
        "Use semantic HTML tags like <header>, <main>, <section> for better accessibility",
        "Always include alt attributes for images",
        "Use proper heading hierarchy (h1, h2, h3...)",
        "Include viewport meta tag for responsive design"
      ],
      'css': [
        "Use CSS Grid or Flexbox for modern layouts",
        "Avoid using !important unless absolutely necessary",
        "Use CSS custom properties (variables) for maintainable code",
        "Consider mobile-first responsive design"
      ],
      'js': [
        "Use const/let instead of var for better scope control",
        "Always handle async operations with try/catch",
        "Use meaningful variable and function names",
        "Consider using arrow functions for cleaner syntax"
      ],
      'py': [
        "Follow PEP 8 style guidelines for Python",
        "Use list comprehensions for cleaner code",
        "Always handle exceptions appropriately",
        "Use virtual environments for project dependencies"
      ]
    };

    const tipList = tips[fileExtension] || tips['js'];
    const randomTip = tipList[Math.floor(Math.random() * tipList.length)];
    return `💡 **${fileExtension?.toUpperCase() || 'Code'} Tip:** ${randomTip}`;
  }

  // Code analysis
  if (lowerMessage.includes('analyze') || lowerMessage.includes('review')) {
    if (!content.trim()) {
      return "📝 Your file is empty. Start by adding some code and I'll help analyze it!";
    }

    const issues = [];
    const suggestions = [];

    if (fileExtension === 'html') {
      if (!content.includes('<!DOCTYPE html>')) issues.push("Missing DOCTYPE declaration");
      if (!content.includes('<meta charset=')) issues.push("Missing charset meta tag");
      if (!content.includes('viewport')) suggestions.push("Add viewport meta tag for mobile responsiveness");
    }

    if (fileExtension === 'js') {
      if (content.includes('var ')) suggestions.push("Consider using 'const' or 'let' instead of 'var'");
      if (content.includes('==') && !content.includes('===')) suggestions.push("Use strict equality (===) instead of loose equality (==)");
    }

    if (fileExtension === 'css') {
      if (content.includes('!important')) suggestions.push("Try to avoid !important - use more specific selectors instead");
    }

    let analysis = "🔍 **Code Analysis:**\n\n";
    if (issues.length > 0) {
      analysis += "**Issues Found:**\n" + issues.map(issue => `• ${issue}`).join('\n') + '\n\n';
    }
    if (suggestions.length > 0) {
      analysis += "**Suggestions:**\n" + suggestions.map(sug => `• ${sug}`).join('\n');
    }
    if (issues.length === 0 && suggestions.length === 0) {
      analysis += "Your code looks good! No major issues detected.";
    }

    return analysis;
  }

  // Error debugging
  if (lowerMessage.includes('error') || lowerMessage.includes('debug') || lowerMessage.includes('fix')) {
    return `🐛 **Debug Helper:**

Common issues in ${fileExtension?.toUpperCase() || 'code'}:

${fileExtension === 'html' ? `• Unclosed tags
• Missing quotes around attributes  
• Incorrect nesting of elements
• Missing alt attributes for images` : ''}

${fileExtension === 'js' ? `• Missing semicolons
• Undefined variables
• Incorrect function syntax
• Async/await usage errors` : ''}

${fileExtension === 'css' ? `• Missing closing braces
• Typos in property names
• Invalid color values
• Incorrect selector syntax` : ''}

Share your specific error message for more targeted help!`;
  }

  // Code explanation
  if (lowerMessage.includes('explain') || lowerMessage.includes('what does')) {
    return `📚 **Code Explanation:**

I'd be happy to explain your code! Here's what I can help with:

• **Function explanations** - How specific functions work
• **Syntax breakdown** - What different symbols and keywords mean  
• **Logic flow** - How your code executes step by step
• **Best practices** - Why certain patterns are recommended

Paste the specific code snippet you'd like me to explain!`;
  }

  // Default responses for common queries
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `👋 Hello! I'm your AI coding assistant. I can help you with:

🔍 **Code Analysis** - Review your code for issues
💡 **Tips & Hints** - Get suggestions for improvement  
🐛 **Debugging** - Find and fix errors
📚 **Explanations** - Understand how code works
✨ **Best Practices** - Learn better coding patterns

What would you like help with today?`;
  }

  if (lowerMessage.includes('help')) {
    return `🚀 **Available Commands:**

• "**analyze my code**" - Review current file
• "**give me a tip**" - Get coding suggestions
• "**help with error**" - Debug assistance  
• "**explain this code**" - Code explanations
• "**best practices**" - Coding recommendations

I can also answer specific questions about ${fileExtension?.toUpperCase() || 'programming'}!`;
  }

  // Default response
  return `🤔 I'd love to help! Try asking me to:
  
• Analyze your current ${fileExtension?.toUpperCase() || 'code'} file
• Give you coding tips and hints
• Help debug any errors you're facing
• Explain specific code concepts

What specific coding help do you need?`;
};

function CodeEditor() {
  const { authUser } = useContext(AuthContext);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const projectId = 'proj1'; // url

  const initialProject = {
    id: projectId,
    title: 'Collaborative App',
    files: [
      {
        id: 'file1',
        name: 'index.html',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Hello World</title>\n    <style>\n        body { \n            font-family: Arial, sans-serif; \n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            color: white;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            min-height: 100vh;\n            margin: 0;\n        }\n        .container {\n            text-align: center;\n            background: rgba(255, 255, 255, 0.1);\n            padding: 2rem;\n            border-radius: 15px;\n            backdrop-filter: blur(10px);\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>🚀 Welcome to the Code Editor!</h1>\n        <p>This is a live HTML preview. Try editing the code!</p>\n        <button onclick="alert(\'Hello from JavaScript!\')" style="padding: 10px 20px; border: none; border-radius: 5px; background: #4CAF50; color: white; cursor: pointer;">Click Me!</button>\n    </div>\n</body>\n</html>'
      },
    ]
  };

  const [project, setProject] = useState(initialProject);
  const [activeFileId, setActiveFileId] = useState(initialProject.files[0].id);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExtension, setNewFileExtension] = useState('html');
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  // Chat-related state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: '👋 Hello! I\'m your AI coding assistant. I can help you analyze code, debug issues, provide tips, and answer programming questions. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeFile = project.files.find(f => f.id === activeFileId);
  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const contentChangeTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!chatInput.trim()) return;

    // أضف رسالة المستخدم
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), type: "user", message: chatInput, timestamp: new Date() }
    ]);

    const userMessage = chatInput;
    setChatInput("");
    setIsTyping(true);

    // استدعاء Laravel API
    const aiReply = await getAIResponse(userMessage);

    // أضف رد AI
    setChatMessages(prev => [
      ...prev,
      { id: Date.now() + 1, type: "ai", message: aiReply, timestamp: new Date() }
    ]);

    setIsTyping(false);
  };


  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load Monaco Editor
  useEffect(() => {
    if (window.monaco) {
      monacoInstanceRef.current = window.monaco;
      setMonacoLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/loader.js";
    script.async = true;
    script.onload = () => {
      window.require.config({
        paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }
      });
      window.require(['vs/editor/editor.main'], function (monaco) {
        monacoInstanceRef.current = monaco;
        setMonacoLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Monaco Editor only once
  useEffect(() => {
    if (!monacoLoaded || !editorRef.current || !monacoInstanceRef.current || monacoEditorRef.current) {
      return;
    }

    // Create editor instance only once
    const language = getLanguageFromExtension(activeFile.name);
    monacoEditorRef.current = monacoInstanceRef.current.editor.create(editorRef.current, {
      value: activeFile.content,
      language: language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      folding: true,
      bracketMatching: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      mouseWheelZoom: true,
      contextmenu: true,
      smoothScrolling: true,
    });

    // Handle content changes with debouncing
    const disposable = monacoEditorRef.current.onDidChangeModelContent(() => {
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }

      contentChangeTimeoutRef.current = setTimeout(() => {
        if (monacoEditorRef.current) {
          const newCode = monacoEditorRef.current.getValue();
          setProject(prevProject => {
            const newFiles = prevProject.files.map(file =>
              file.id === activeFileId ? { ...file, content: newCode } : file
            );
            return { ...prevProject, files: newFiles };
          });
        }
      }, 100);
    });

    // Focus the editor after creation
    setTimeout(() => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.focus();
      }
    }, 100);

    return () => {
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }
      disposable.dispose();
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, [monacoLoaded]);

  // Update editor content and language when active file changes
  useEffect(() => {
    if (!monacoEditorRef.current || !activeFile) return;

    const currentValue = monacoEditorRef.current.getValue();
    const newLanguage = getLanguageFromExtension(activeFile.name);

    if (currentValue !== activeFile.content) {
      const position = monacoEditorRef.current.getPosition();
      const model = monacoEditorRef.current.getModel();
      if (model) {
        model.setValue(activeFile.content);
      }

      if (position && position.lineNumber <= model.getLineCount()) {
        monacoEditorRef.current.setPosition(position);
      }
    }

    const model = monacoEditorRef.current.getModel();
    if (model && monacoInstanceRef.current) {
      monacoInstanceRef.current.editor.setModelLanguage(model, newLanguage);
    }

    setTimeout(() => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.focus();
      }
    }, 50);
  }, [activeFileId, activeFile]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('Saving...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Saving project:', project);
    setStatus('Saved successfully!');
    setIsSaving(false);
    setTimeout(() => setStatus(''), 3000);

    setTimeout(() => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.focus();
      }
    }, 100);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;

    const fullFileName = `${newFileName.trim()}.${newFileExtension}`;
    const newFile = {
      id: `file${Date.now()}`,
      name: fullFileName,
      content: getDefaultContent(fullFileName),
    };

    setProject(prevProject => ({
      ...prevProject,
      files: [...prevProject.files, newFile],
    }));

    setActiveFileId(newFile.id);
    setIsAddingFile(false);
    setNewFileName('');
    setStatus(`Created ${fullFileName}`);
    setTimeout(() => setStatus(''), 2000);

    setTimeout(() => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.focus();
      }
    }, 200);
  };

  const deleteFile = (fileId) => {
    if (project.files.length <= 1) {
      setStatus('Cannot delete the last file');
      setTimeout(() => setStatus(''), 2000);
      return;
    }

    setProject(prevProject => {
      const newFiles = prevProject.files.filter(file => file.id !== fileId);
      return { ...prevProject, files: newFiles };
    });

    if (fileId === activeFileId) {
      const remainingFiles = project.files.filter(file => file.id !== fileId);
      setActiveFileId(remainingFiles[0].id);
    }

    setStatus('File deleted');
    setTimeout(() => setStatus(''), 2000);
  };

  // Chat functionality
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      // const aiResponse = getStaticAIResponse(chatInput, activeFile, project.files);
      const aiResponse = getDynamicAIResponse(chatInput, activeFile, project.files);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action) => {
    setChatInput(action);
    handleSendMessage();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-50">
          <span className="text-sky-400">Project:</span> {project.title}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <MessageSquare size={18} /> Chat
          </button>
          <span className={`text-sm px-3 py-1 rounded-full ${status.includes('Saved') ? 'bg-green-900 text-green-200' :
            status.includes('Created') ? 'bg-blue-900 text-blue-200' :
              status.includes('deleted') ? 'bg-red-900 text-red-200' :
                status.includes('Error') ? 'bg-red-900 text-red-200' :
                  'text-gray-400'
            }`}>
            {status || 'Ready'}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${isSaving
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
              }`}
          >
            {isSaving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* File Explorer */}
        <div className="lg:w-1/4 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-50">Files</h3>
            <button
              onClick={() => setIsAddingFile(true)}
              className="px-3 py-1 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-all transform hover:scale-105"
            >
              + New File
            </button>
          </div>

          {/* Add File Form */}
          {isAddingFile && (
            <div className="flex flex-col space-y-3 mb-4 p-3 bg-gray-700 rounded-lg">
              <input
                type="text"
                placeholder="Enter file name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              />
              <select
                value={newFileExtension}
                onChange={(e) => setNewFileExtension(e.target.value)}
                className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              >
                <option value="html">.html</option>
                <option value="css">.css</option>
                <option value="js">.js</option>
                <option value="ts">.ts</option>
                <option value="jsx">.jsx</option>
                <option value="py">.py</option>
                <option value="php">.php</option>
                <option value="java">.java</option>
                <option value="cpp">.cpp</option>
                <option value="md">.md</option>
                <option value="json">.json</option>
                <option value="txt">.txt</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateFile}
                  className="flex-1 p-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsAddingFile(false);
                    setNewFileName('');
                  }}
                  className="flex-1 p-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* File List */}
          <ul className="space-y-2">
            {project.files.map(file => (
              <li
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${file.id === activeFileId
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'hover:bg-gray-700'
                  }`}
              >
                <div
                  className="flex items-center space-x-2 flex-1"
                  onClick={() => {
                    setActiveFileId(file.id);
                    setTimeout(() => {
                      if (monacoEditorRef.current) {
                        monacoEditorRef.current.focus();
                      }
                    }, 100);
                  }}
                >
                  <FileTextIcon />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                    {getLanguageFromExtension(file.name)}
                  </span>
                </div>
                {project.files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                    className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete file"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Editor and AI Chat */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <label className="text-lg font-semibold text-gray-50">
                Code Editor: {activeFile?.name}
              </label>
              <span className="text-sm text-gray-400">
                Language: {getLanguageFromExtension(activeFile?.name || '')}
              </span>
            </div>
            <div
              className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-gray-700"
              onClick={() => {
                if (monacoEditorRef.current) {
                  monacoEditorRef.current.focus();
                }
              }}
            >
              <div ref={editorRef} className="w-full h-full" />
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col" style={{ height: '400px' }}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-sky-400" />
                <h3 className="text-lg font-semibold text-gray-50">AI Coding Assistant</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleQuickAction('analyze my code')}
                  className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="Analyze Code"
                >
                  <Code className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleQuickAction('give me a tip')}
                  className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                  title="Get Tip"
                >
                  <Lightbulb className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleQuickAction('help with error')}
                  className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="Debug Help"
                >
                  <Bug className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-sky-600' : 'bg-gray-700'
                    }`}>
                    {msg.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-sky-400" />
                    )}
                  </div>
                  <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${msg.type === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                      }`}>
                      <div className="text-sm whitespace-pre-line">{msg.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-sky-400" />
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me about your code, request tips, or get debugging help..."
                  className="flex-1 p-3 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => setChatInput('analyze my code')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  Analyze Code
                </button>
                <button
                  onClick={() => setChatInput('give me a tip')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  Get Tip
                </button>
                <button
                  onClick={() => setChatInput('help with error')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  Debug Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ✅ Sidebar Chat */}
      {/* ✅ Sidebar Chat */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l z-50 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b bg-purple-600 text-white">
            <h2 className="font-semibold">Project Chat</h2>
            <button onClick={() => setIsChatOpen(false)}>
              <X size={20} />
            </button>
          </div>
          {/* Chat Component */}
          <Chat user={authUser} projectId={projectId} />
        </div>
      )}
    </div>

  );
}

export default CodeEditor;