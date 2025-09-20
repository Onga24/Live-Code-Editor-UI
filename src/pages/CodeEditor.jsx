import { MessageSquare } from "lucide-react";
import Chat from './Chat';
import ChatAssistant from './ChatAssistant';
import { getLanguageFromExtension, getDefaultContent, FileTextIcon } from "../lib/codeUtils.jsx"; // هنفصل uti
import { getAiCodeSuggestions, handleAiCompletion, handleAiImprove, applyAiSuggestion, } from "../lib/aiService.js"; // هنفصل uti
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Send, Bot, User, Lightbulb, Bug, Code, Upload, Trash2, X } from 'lucide-react';
import { AuthContext } from "../context/AuthContext"; // Add this import
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from "react-router-dom";
// use file Utils
import {
  handleSave, handleCreateFile, handleFileUpload, deleteFile, handleDeleteFile, handleDeleteMultipleFiles,
  scrollToTop, handleFileSwitch
} from "../lib/fileUtlis.js"
import { FileUtilsContext } from "../context/fileContext.jsx";

function CodeEditor() {
  const ctx = useContext(FileUtilsContext);
  const { project, setProject, status, setStatus, activeFileId, setActiveFileId,
    showDeleteConfirm, setShowDeleteConfirm, isAddingFile, setIsAddingFile,
    isSaving, setIsSaving, isUploading, setIsUploading, selectedFiles,
    newFileName, setNewFileName, newFileExtension, setNewFileExtension,
    setSelectedFiles, monacoEditorRef, contentChangeTimeoutRef } = ctx;
  const { apiRequest } = useContext(AuthContext); // Get apiRequest from context
  const { authUser } = useContext(AuthContext);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const projectId = params.get("project_id"); // هترجع "1" أو أي رقم


  // const [project, setProject] = useState(initialProject);
  // const [activeFileId, setActiveFileId] = useState(initialProject.files[0].id);
  // const [status, setStatus] = useState('');
  // const [isSaving, setIsSaving] = useState(false);
  // const [isAddingFile, setIsAddingFile] = useState(false);

  const [monacoLoaded, setMonacoLoaded] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);
  // const [selectedFiles, setSelectedFiles] = useState([]);
  // const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: '👋 Hello! I\'m your AI coding assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const activeFile = project?.files?.find(f => f.id === activeFileId);
  console.log(activeFile ? activeFile.name : "No file selected");
  const editorRef = useRef(null);
  // const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  // const contentChangeTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);

  // Get project ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project_id');
    if (projectId) {
      setProject(prev => ({ ...prev, id: projectId }));
      loadProject(projectId);
    }
  }, []);


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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initialize Monaco Editor with AI features
  useEffect(() => {
    if (!monacoLoaded || !editorRef.current || !monacoInstanceRef.current || monacoEditorRef.current) {
      return;
    }

    const language = getLanguageFromExtension(activeFile?.name || "text");
    monacoEditorRef.current = monacoInstanceRef.current.editor.create(editorRef.current, {
      value: activeFile?.content || "",
      language: language,
      theme: 'hc-black',
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
      contextmenu: true,
      smoothScrolling: true,
      // Enable AI-powered features
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      quickSuggestions: true,
      snippetSuggestions: 'top',
      wordBasedSuggestions: true
    });

    // Handle content changes with debouncing - FIXED VERSION
    const disposable = monacoEditorRef.current.onDidChangeModelContent(() => {
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }

      // Capture the current active file ID when the change happens
      const currentActiveFileId = activeFileId;


      contentChangeTimeoutRef.current = setTimeout(() => {
        if (monacoEditorRef.current) {
          const newCode = monacoEditorRef.current.getValue();
          setProject(prevProject => {
            const newFiles = prevProject.files.map(file =>
              file.id === currentActiveFileId ? { ...file, content: newCode } : file
            );
            return { ...prevProject, files: newFiles };
          });
        }
      }, 100);
    });

    // AI-powered keyboard shortcuts
    monacoEditorRef.current.addCommand(monacoInstanceRef.current.KeyMod.CtrlCmd | monacoInstanceRef.current.KeyCode.Space, handleAiCompletion);
    monacoEditorRef.current.addCommand(monacoInstanceRef.current.KeyMod.CtrlCmd | monacoInstanceRef.current.KeyMod.Shift | monacoInstanceRef.current.KeyCode.KeyI, handleAiImprove);

    // Selection change handler for AI context
    const selectionDisposable = monacoEditorRef.current.onDidChangeCursorSelection((e) => {
      const selection = monacoEditorRef.current.getModel().getValueInRange(e.selection);
      setSelectedText(selection);
    });

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
      selectionDisposable.dispose();
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, [monacoLoaded, activeFileId]); // Added activeFileId dependency

  // Update editor when active file changes
  useEffect(() => {
    if (!monacoEditorRef.current || !activeFile) return;

    // Clear any pending content updates to prevent cross-file contamination
    if (contentChangeTimeoutRef.current) {
      clearTimeout(contentChangeTimeoutRef.current);
      contentChangeTimeoutRef.current = null;
    }

    const currentValue = monacoEditorRef.current.getValue();
    const newLanguage = getLanguageFromExtension(activeFile.name);

    if (currentValue !== activeFile.content) {
      // Temporarily disable change events while updating content
      const model = monacoEditorRef.current.getModel();
      if (model) {
        // Save cursor position
        const position = monacoEditorRef.current.getPosition();

        // Update content
        model.setValue(activeFile.content);

        // Restore cursor position if valid
        if (position && position.lineNumber <= model.getLineCount()) {
          monacoEditorRef.current.setPosition(position);
        }
      }
    }

    // Update language

    const model = monacoEditorRef.current.getModel();
    if (model && monacoInstanceRef.current) {
      monacoInstanceRef.current.editor.setModelLanguage(model, newLanguage);
    }

    // Focus editor after file switch
    setTimeout(() => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.focus();
      }
    }, 50);
  }, [activeFileId, activeFile]);

  // Load project from backend
  const loadProject = async (projectId) => {
    try {
      const response = await apiRequest(`/projects/${projectId}/files`, 'GET');

      if (response.success && response.files) {
        const loadedFiles = response.files.map((file, index) => ({
          id: file.id ? `file${file.id}` : `file${index}`,
          name: file.name || file.original_name || `file${index}.txt`,
          content: file.content || getDefaultContent(file.name || file.original_name || 'file.txt')
        }));

        setProject(prev => ({
          ...prev,
          id: projectId,
          title: response.project?.name || prev.title,
          files: loadedFiles.length > 0 ? loadedFiles : prev.files
        }));

        if (loadedFiles.length > 0) {
          setActiveFileId(loadedFiles[0].id);
        }
        scrollToTop()
        setStatus('Project loaded successfully');
      } else {
        setStatus('Failed to load project files');
      }
    } catch (error) {
      console.error('Load error:', error);
      setStatus('Error loading project');
    }
    setTimeout(() => setStatus(''), 3000);
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

    setTimeout(() => {
      const aiResponse = getAIResponse(chatInput, activeFile, project.files);
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

  // Save current file content before switching




  return (
    <div className="min-h-screen bg-[#1a1c22] text-gray-300 p-6 md:p-12 font-sans flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center pb-6 md:pb-10 border-b border-gray-700 mb-6">
        <h1 className="text-4xl font-extrabold text-white mb-4 md:mb-0">
          <span className="text-cyan-400">Project:</span> {project.title}
        </h1>
        <div className="flex items-center space-x-4">
          {/* Status indicator */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <MessageSquare size={18} /> Chat
            </button>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${status.includes('Saved') || status.includes('loaded')
              ? 'bg-green-600 text-green-100'
              : status.includes('Created')
                ? 'bg-blue-600 text-blue-100'
                : status.includes('deleted') || status.includes('Error') || status.includes('failed')
                  ? 'bg-red-600 text-red-100'
                  : 'bg-gray-700 text-gray-400'
              }`}>
              {status || 'Ready'}
            </span>
            {/* New File button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !project.id}
              className={`px-5 py-2 rounded-xl font-semibold transition-all duration-200 ${isSaving || !project.id
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                }`}
            >
              Save Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* File Explorer */}
        <aside className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-100">File Explorer</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingFile(true)}
                className="px-3 py-1 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-colors"
                title="Create New File"
              >
                + New
              </button>
              <label className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Upload
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(ctx, e, apiRequest, loadProject)}
                  className="hidden"
                  disabled={isUploading || !project.id}
                />
              </label>
              {selectedFiles.length > 0 && (
                <button
                  onClick={() => handleDeleteMultipleFiles(ctx)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  title={`Delete ${selectedFiles.length} selected file(s)`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* File selection controls */}
          {project.files.length > 1 && (
            <div className="flex justify-between items-center mb-4 text-xs text-gray-400">
              <span>{selectedFiles.length} selected</span>
              <div className="space-x-2">
                <button
                  onClick={() => setSelectedFiles(project.files.map(f => f.id))}
                  className="hover:text-cyan-400"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="hover:text-cyan-400"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Add File Form */}
          {isAddingFile && (
            <div className="flex flex-col space-y-3 mb-6 p-4 bg-gray-700 rounded-lg shadow-inner">
              <input
                type="text"
                placeholder="Enter file name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateFile(ctx);  // ✅
                }}
              />
              <select
                value={newFileExtension}
                onChange={(e) => setNewFileExtension(e.target.value)}
                className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['html', 'css', 'js', 'ts', 'jsx', 'py', 'php', 'java', 'cpp', 'md', 'json', 'txt'].map(ext => (
                  <option key={ext} value={ext}>.{ext}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCreateFile(ctx)}
                  className="flex-1 p-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsAddingFile(false);
                    setNewFileName('');
                  }}
                  className="flex-1 p-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* File List */}
          <ul className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
            {project.files.map(file => (
              <li
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${file.id === activeFileId
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : selectedFiles.includes(file.id)
                    ? 'bg-gray-700 ring-2 ring-cyan-500'
                    : 'hover:bg-gray-700'
                  }`}
              >
                <div className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.id]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                      }
                    }}
                    className="rounded text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div
                  className="flex items-center space-x-2 flex-1 min-w-0"
                  onClick={() => handleFileSwitch(ctx, file.id)}
                >
                  <FileTextIcon className="text-gray-400" />
                  <span className="truncate">{file.name}</span>
                </div>
                {project.files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(ctx, file.id);
                    }}
                    className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor & Chat Assistant */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Code Editor: <span className="text-cyan-400">{activeFile?.name}</span>
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Language: {getLanguageFromExtension(activeFile?.name || '')}</span>
              </div>
            </div>

            {/* AI Suggestions Panel */}
            {showAiSuggestions && aiSuggestions.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-semibold text-white">AI Suggestions ✨</h4>
                  <button
                    onClick={() => setShowAiSuggestions(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-400">
                          {suggestion.title || `Suggestion ${index + 1}`}
                        </span>
                        <button
                          onClick={() => applyAiSuggestion(suggestion)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {suggestion.description && (
                        <p className="text-xs text-gray-300 mb-2">{suggestion.description}</p>
                      )}
                      <pre className="bg-gray-900 p-2 rounded text-xs text-gray-200 overflow-x-auto border border-gray-700">
                        <code>{suggestion.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 min-h-[50vh] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
              <div ref={editorRef} className="w-full h-full" />
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
              <div className="flex space-x-4">
                {selectedText && <span>Selection: {selectedText.length} chars</span>}
              </div>
              <div className="flex items-center space-x-2">
                {isLoadingAi && <span className="text-cyan-400 animate-pulse">AI processing...</span>}
                <span>Lines: {activeFile?.content.split('\n').length || 0}</span>
              </div>
            </div>
          </div>

          {/* AI Chat Assistant */}
          <ChatAssistant />
        </div>
      </div>

      {/* Sidebar Chat */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-gray-800 shadow-2xl border-l border-gray-700 z-50 flex flex-col transition-transform duration-300 ease-in-out">
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
            <h2 className="font-semibold text-lg text-white">AI Chat Assistant 🤖</h2>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <Chat user={authUser} projectId={projectId} />
        </div>
      )}
    </div>


  );


}
export default CodeEditor;