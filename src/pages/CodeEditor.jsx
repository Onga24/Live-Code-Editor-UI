// export default CodeEditor
import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import Chat from './Chat';
import ChatAssistant from './ChatAssistant';
import { getLanguageFromExtension, getDefaultContent , FileTextIcon} from "../lib/codeUtils.jsx"; // هنفصل util


function CodeEditor() {
  const { authUser } = useContext(AuthContext);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const projectId = params.get("project_id"); // هترجع "1" أو أي رقم

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

  const activeFile = project.files.find(f => f.id === activeFileId);
  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const contentChangeTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);


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
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            status.includes('Saved')
              ? 'bg-green-900 text-green-200'
              : status.includes('Created')
              ? 'bg-blue-900 text-blue-200'
              : status.includes('deleted')
              ? 'bg-red-900 text-red-200'
              : status.includes('Error')
              ? 'bg-red-900 text-red-200'
              : 'text-gray-400'
          }`}
        >
          {status || 'Ready'}
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isSaving
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
          {project.files.map((file) => (
            <li
              key={file.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                file.id === activeFileId ? 'bg-sky-600 text-white shadow-lg' : 'hover:bg-gray-700'
              }`}
            >
              <div
                className="flex items-center space-x-2 flex-1"
                onClick={() => {
                  setActiveFileId(file.id);
                  setTimeout(() => {
                    monacoEditorRef.current?.focus();
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
            onClick={() => monacoEditorRef.current?.focus()}
          >
            <div ref={editorRef} className="w-full h-full" />
          </div>
        </div>

        {/* AI Chat Assistant */}
        <ChatAssistant />
      </div>
    </div>

    {/* Sidebar Chat */}
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