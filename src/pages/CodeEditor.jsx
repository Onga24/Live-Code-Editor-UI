// Complete CodeEditor.js with all Real-time Features Integrated - FIXED

import { MessageSquare, Users, Eye, EyeOff, Wifi, WifiOff } from "lucide-react";
import Chat from './Chat';
import ChatAssistant from './ChatAssistant';
import { getLanguageFromExtension, getDefaultContent, FileTextIcon } from "../lib/codeUtils.jsx";
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Upload, Trash2, X } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import {
  handleSave, handleCreateFile, handleFileUpload, handleDeleteFile, handleDeleteMultipleFiles,
  scrollToTop, handleFileSwitch
} from "../lib/fileUtlis.js";
import { FileUtilsContext } from "../context/fileContext.jsx";

function CodeEditor() {
  const ctx = useContext(FileUtilsContext);
  const { project, setProject, status, setStatus, activeFileId, setActiveFileId,
    showDeleteConfirm, setShowDeleteConfirm, isAddingFile, setIsAddingFile,
    isSaving, setIsSaving, isUploading, setIsUploading, selectedFiles,
    newFileName, setNewFileName, newFileExtension, setNewFileExtension,
    setSelectedFiles, monacoEditorRef, contentChangeTimeoutRef } = ctx;
  
  const { apiRequest, authUser } = useContext(AuthContext);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const projectId = params.get("project_id");

  // Real-time states
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [currentlyEditing, setCurrentlyEditing] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [showOtherEdits, setShowOtherEdits] = useState(true);
  const [lastUpdateBy, setLastUpdateBy] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Editor refs
  const activeFile = project?.files?.find(f => f.id === activeFileId);
  const editorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // ✅ FIXED: تعريف المتغير في المكان الصحيح
  const realTimeUpdateTimeoutRef = useRef(null);

  // ✅ دالة إرسال التحديثات للسيرفر - محسّنة
  const sendFileUpdate = async (fileId, content, projectId, apiRequest) => {
    try {
      const numericFileId = fileId.replace('file', '');
      
      const response = await apiRequest(
        `/projects/${projectId}/files/${numericFileId}/content`, 
        'PATCH', 
        { content }
      );
      
      if (response.success) {
        console.log('File updated successfully on server');
      } else {
        console.error('Failed to send file update:', response);
        // إعادة المحاولة مرة واحدة فقط
        setTimeout(() => {
          sendFileUpdate(fileId, content, projectId, apiRequest);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending file update:', error);
      // معالجة الأخطاء بدون إعادة محاولة لا نهائية
    }
  };

  // Initialize project from URL
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

  // Complete Real-time WebSocket Integration
  useEffect(() => {
    if (!projectId || !authUser?.id) return;

    const channel = window.Echo.private(`project.${projectId}`);
    let heartbeatInterval;
    
    channel.subscribed(() => {
      console.log('Successfully subscribed to project channel');
      setIsConnected(true);
      
      // Send initial presence
      channel.whisper('user-online', {
        user_id: authUser.id,
        user_name: authUser.name || `User ${authUser.id}`,
        timestamp: new Date().toISOString()
      });

      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        channel.whisper('heartbeat', {
          user_id: authUser.id,
          timestamp: new Date().toISOString()
        });
      }, 30000);
    });

    channel.error((error) => {
      console.error('Channel subscription error:', error);
      setIsConnected(false);
    });

    // Listen for user presence
    channel.listenForWhisper('user-online', (e) => {
      if (e.user_id !== authUser.id) {
        setOnlineUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.set(e.user_id, {
            id: e.user_id,
            name: e.user_name,
            lastSeen: e.timestamp,
            isOnline: true
          });
          return newUsers;
        });
      }
    });

    channel.listenForWhisper('user-offline', (e) => {
      setOnlineUsers(prev => {
        const newUsers = new Map(prev);
        newUsers.delete(e.user_id);
        return newUsers;
      });
      
      setCurrentlyEditing(prev => {
        const newEditing = new Map(prev);
        for (let [fileId, editor] of newEditing.entries()) {
          if (editor.userId === e.user_id) {
            newEditing.delete(fileId);
          }
        }
        return newEditing;
      });
    });

    // Listen for editing status
    channel.listenForWhisper('editing-start', (e) => {
      if (e.user_id !== authUser.id) {
        setCurrentlyEditing(prev => {
          const newEditing = new Map(prev);
          newEditing.set(e.file_id, {
            userId: e.user_id,
            userName: e.user_name,
            timestamp: new Date(e.timestamp)
          });
          return newEditing;
        });
      }
    });

    channel.listenForWhisper('editing-stop', (e) => {
      setCurrentlyEditing(prev => {
        const newEditing = new Map(prev);
        newEditing.delete(e.file_id);
        return newEditing;
      });
    });

    // ✅ Listen for file updates - محسّن
    channel.listen('.FileUpdated', (e) => {
      console.log('FileUpdated event received:', e);
      
      // تجاهل التحديثات الخاصة بالمستخدم الحالي أو إذا كان الإعداد مغلق
      if (!showOtherEdits || e.user_id === authUser?.id) {
        return;
      }

      const updatedFileId = `file${e.file.id}`;
      const editorInfo = onlineUsers.get(e.user_id);

      // تحديث الحالة المحلية
      setProject((prevProject) => {
        const updatedFiles = prevProject.files.map((file) => {
          if (file.id === updatedFileId) {
            return {
              ...file,
              content: e.file.content,
              name: e.file.name || e.file.original_name,
              lastUpdatedBy: e.user_id
            };
          }
          return file;
        });
        return { ...prevProject, files: updatedFiles };
      });

      // تحديث المحرر إذا كان هو الملف النشط
      if (activeFileId === updatedFileId && monacoEditorRef.current) {
        const currentContent = monacoEditorRef.current.getValue();
        
        if (currentContent !== e.file.content) {
          const position = monacoEditorRef.current.getPosition();
          const model = monacoEditorRef.current.getModel();
          
          if (model) {
            // إضافة مؤشر بصري للتحديث
            const decorations = monacoEditorRef.current.deltaDecorations([], [
              {
                range: new monacoInstanceRef.current.Range(1, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount())),
                options: {
                  className: 'updated-by-other-user',
                  isWholeLine: false,
                  glyphMarginClassName: 'updated-glyph'
                }
              }
            ]);

            // تحديث المحتوى مع الحفاظ على موضع المؤشر
            model.setValue(e.file.content);
            
            if (position && position.lineNumber <= model.getLineCount()) {
              monacoEditorRef.current.setPosition(position);
            }

            // إزالة المؤشر البصري بعد 3 ثواني
            setTimeout(() => {
              if (monacoEditorRef.current) {
                monacoEditorRef.current.deltaDecorations(decorations, []);
              }
            }, 3000);
          }
        }
      }

      // إظهار إشعار التحديث
      const editorName = editorInfo?.name || `User #${e.user_id}`;
      setLastUpdateBy(editorName);
      setStatus(`File updated by ${editorName}`);
      setTimeout(() => {
        setStatus('');
        setLastUpdateBy(null);
      }, 3000);
    });

    // Listen for file deletions
    channel.listen('.FileDeleted', (e) => {
      if (!showOtherEdits || e.deleted_by === authUser?.id) return;

      const deletedFileId = `file${e.file_id}`;
      const editorInfo = onlineUsers.get(e.deleted_by);
      const editorName = editorInfo?.name || `User #${e.deleted_by}`;

      setProject((prevProject) => {
        const updatedFiles = prevProject.files.filter(file => file.id !== deletedFileId);
        
        if (activeFileId === deletedFileId && updatedFiles.length > 0) {
          setActiveFileId(updatedFiles[0].id);
        }

        return { ...prevProject, files: updatedFiles };
      });

      setStatus(`File "${e.file_name}" was deleted by ${editorName}`);
      setTimeout(() => setStatus(''), 3000);
    });

    // Listen for whisper events (notifications)
    channel.listenForWhisper('file-created', (e) => {
      if (e.user_id !== authUser.id) {
        const editorName = e.user_name || `User #${e.user_id}`;
        setStatus(`${editorName} created "${e.file_name}"`);
        setTimeout(() => setStatus(''), 2000);
      }
    });

    channel.listenForWhisper('project-saved', (e) => {
      if (e.user_id !== authUser.id) {
        const editorName = e.user_name || `User #${e.user_id}`;
        setStatus(`${editorName} saved the project (${e.saved_files} files)`);
        setTimeout(() => setStatus(''), 2000);
      }
    });

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      
      channel.whisper('user-offline', {
        user_id: authUser.id,
        timestamp: new Date().toISOString()
      });
      
      if (activeFileId) {
        channel.whisper('editing-stop', {
          user_id: authUser.id,
          file_id: activeFileId,
          timestamp: new Date().toISOString()
        });
      }

      window.Echo.leave(`project.${projectId}`);
      setIsConnected(false);
      setOnlineUsers(new Map());
      setCurrentlyEditing(new Map());
    };
  }, [projectId, activeFileId, authUser?.id, showOtherEdits]);

  // ✅ Initialize Monaco Editor with enhanced real-time features - FIXED
  useEffect(() => {
    if (!monacoLoaded || !editorRef.current || !monacoInstanceRef.current || monacoEditorRef.current) {
      return;
    }

    const language = getLanguageFromExtension(activeFile?.name || "text");
    monacoEditorRef.current = monacoInstanceRef.current.editor.create(editorRef.current, {
      value: activeFile?.content || "",
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
      contextmenu: true,
      smoothScrolling: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      quickSuggestions: true,
      snippetSuggestions: 'top',
      wordBasedSuggestions: true
    });

    // ✅ معالج التحديثات مع الإرسال الفوري للسيرفر - FIXED
    const disposable = monacoEditorRef.current.onDidChangeModelContent((e) => {
      const currentContent = monacoEditorRef.current.getValue();
      
      // إرسال مؤشر الكتابة
      if (projectId && authUser?.id) {
        const channel = window.Echo.private(`project.${projectId}`);
        channel.whisper('editing-start', {
          user_id: authUser.id,
          user_name: authUser.name,
          file_id: activeFileId,
          timestamp: new Date().toISOString()
        });

        // مسح timeout الكتابة السابق
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // إيقاف مؤشر الكتابة بعد عدم النشاط
        typingTimeoutRef.current = setTimeout(() => {
          channel.whisper('editing-stop', {
            user_id: authUser.id,
            file_id: activeFileId,
            timestamp: new Date().toISOString()
          });
        }, 2000);
      }

      // ✅ تحديث المحتوى محلياً
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }

      const currentActiveFileId = activeFileId;
      
      // تأخير قصير لتحديث الحالة المحلية
      contentChangeTimeoutRef.current = setTimeout(() => {
        if (monacoEditorRef.current) {
          const newContent = monacoEditorRef.current.getValue();
          setProject(prevProject => {
            const newFiles = prevProject.files.map(file =>
              file.id === currentActiveFileId ? { ...file, content: newContent, lastUpdatedBy: authUser?.id } : file
            );
            return { ...prevProject, files: newFiles };
          });
        }
      }, 300);

      // ✅ إرسال التحديث للسيرفر (مع تأخير أطول لتقليل الطلبات)
      if (realTimeUpdateTimeoutRef.current) {
        clearTimeout(realTimeUpdateTimeoutRef.current);
      }

      realTimeUpdateTimeoutRef.current = setTimeout(() => {
        if (projectId && currentActiveFileId) {
          sendFileUpdate(currentActiveFileId, currentContent, projectId, apiRequest);
        }
      }, 1500); // تأخير 1.5 ثانية لإرسال السيرفر
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
      if (realTimeUpdateTimeoutRef.current) {
        clearTimeout(realTimeUpdateTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      disposable.dispose();
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, [monacoLoaded, activeFileId, authUser?.id, projectId]);

  // Update editor when active file changes
  useEffect(() => {
    if (!monacoEditorRef.current || !activeFile) return;

    if (contentChangeTimeoutRef.current) {
      clearTimeout(contentChangeTimeoutRef.current);
      contentChangeTimeoutRef.current = null;
    }

    const currentValue = monacoEditorRef.current.getValue();
    const newLanguage = getLanguageFromExtension(activeFile.name);

    if (currentValue !== activeFile.content) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        const position = monacoEditorRef.current.getPosition();
        model.setValue(activeFile.content);
        
        if (position && position.lineNumber <= model.getLineCount()) {
          monacoEditorRef.current.setPosition(position);
        }
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

  // Load project from backend
  const loadProject = async (projectId) => {
    try {
      const response = await apiRequest(`/projects/${projectId}/files`, 'GET');

      if (response.success && response.files) {
        const loadedFiles = response.files.map((file, index) => ({
          id: file.id ? `file${file.id}` : `file${index}`,
          name: file.name || file.original_name || `file${index}.txt`,
          content: file.content || getDefaultContent(file.name || file.original_name || 'file.txt'),
          lastUpdatedBy: null
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
        scrollToTop();
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

  // Render online users indicator
  const renderOnlineUsers = () => (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <span className="text-xs text-gray-400">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {onlineUsers.size > 0 && (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-400">
            {onlineUsers.size} online
          </span>
          <div className="flex -space-x-1">
            {Array.from(onlineUsers.values()).slice(0, 3).map(user => (
              <div
                key={user.id}
                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-gray-800"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {onlineUsers.size > 3 && (
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-gray-800">
                +{onlineUsers.size - 3}
              </div>
            )}
          </div>
        </div>
      )}
      
      {lastUpdateBy && (
        <span className="text-xs text-yellow-400 animate-pulse">
          Updated by {lastUpdateBy}
        </span>
      )}
      
      <button
        onClick={() => setShowOtherEdits(!showOtherEdits)}
        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
          showOtherEdits 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
        }`}
        title={showOtherEdits ? "Hide other users' edits" : "Show other users' edits"}
      >
        {showOtherEdits ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        <span>{showOtherEdits ? 'Hide Others' : 'Show Others'}</span>
      </button>
    </div>
  );

  // Render file list with editing indicators
  const renderFileList = () => (
    <ul className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
      {project.files.map(file => {
        const isBeingEdited = currentlyEditing.has(file.id);
        const editor = currentlyEditing.get(file.id);
        const isNewFile = file.isNew;
        
        return (
          <li
            key={file.id}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              file.id === activeFileId
                ? 'bg-cyan-600 text-white shadow-lg'
                : selectedFiles.includes(file.id)
                ? 'bg-gray-700 ring-2 ring-cyan-500'
                : isBeingEdited
                ? 'bg-yellow-700 ring-2 ring-yellow-400'
                : isNewFile
                ? 'bg-green-700 ring-2 ring-green-400'
                : 'hover:bg-gray-700'
            } ${isBeingEdited ? 'currently-editing' : ''}`}
            title={isBeingEdited ? `Being edited by ${editor.userName}` : isNewFile ? 'Newly created file' : ''}
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
              
              {isBeingEdited && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs bg-yellow-500 text-black px-1 rounded font-medium">
                    {editor.userName}
                  </span>
                </div>
              )}
              
              {isNewFile && (
                <span className="text-xs bg-green-500 text-white px-1 rounded font-medium">
                  NEW
                </span>
              )}
            </div>
            
            {project.files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(ctx, file.id, apiRequest);
                }}
                className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <style>{`
        .updated-by-other-user {
          background-color: rgba(255, 193, 7, 0.1) !important;
          border-left: 3px solid #ffc107 !important;
        }

        .updated-glyph {
          background-color: #ffc107 !important;
          width: 4px !important;
        }

        .currently-editing {
          position: relative;
        }

        .currently-editing::after {
          content: '';
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background-color: #28a745;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateY(-50%) scale(1.1); }
          100% { opacity: 1; transform: translateY(-50%) scale(1); }
        }
      `}</style>
      
      <div className="min-h-screen bg-[#1a1c22] text-gray-300 p-6 md:p-12 font-sans flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center pb-6 md:pb-10 border-b border-gray-700 mb-6">
          <h1 className="text-4xl font-extrabold text-white mb-4 md:mb-0">
            <span className="text-cyan-400">Project:</span> {project.title}
          </h1>
          
          <div className="flex items-center space-x-4">
            {renderOnlineUsers()}
            
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              status.includes('Saved') || status.includes('loaded')
                ? 'bg-green-600 text-green-100'
                : status.includes('Created') || status.includes('Uploaded')
                ? 'bg-blue-600 text-blue-100'
                : status.includes('deleted') || status.includes('Error') || status.includes('failed')
                ? 'bg-red-600 text-red-100'
                : status.includes('updated by')
                ? 'bg-yellow-600 text-yellow-100'
                : 'bg-gray-700 text-gray-400'
            }`}>
              {status || 'Ready'}
            </span>
            
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MessageSquare size={18} /> Chat
            </button>
            
            <button
              onClick={() => handleSave(ctx, apiRequest)}
              disabled={isSaving || !project.id}
              className={`px-5 py-2 rounded-xl font-semibold transition-all duration-200 ${
                isSaving || !project.id
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
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
                    onClick={() => handleDeleteMultipleFiles(ctx, apiRequest)}
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
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="hover:text-cyan-400 transition-colors"
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
                    if (e.key === 'Enter') handleCreateFile(ctx, apiRequest);
                  }}
                  autoFocus
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
                    onClick={() => handleCreateFile(ctx, apiRequest)}
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
            {renderFileList()}
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
                  {activeFile?.lastUpdatedBy && activeFile.lastUpdatedBy !== authUser?.id && (
                    <span className="text-yellow-400">
                      Last updated by User #{activeFile.lastUpdatedBy}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-[50vh] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                <div ref={editorRef} className="w-full h-full" />
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <div className="flex space-x-4">
                  <span>Lines: {activeFile?.content.split('\n').length || 0}</span>
                  <span>Characters: {activeFile?.content.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {currentlyEditing.has(activeFileId) && currentlyEditing.get(activeFileId)?.userId !== authUser?.id && (
                    <span className="text-yellow-400 animate-pulse">
                      {currentlyEditing.get(activeFileId)?.userName} is editing...
                    </span>
                  )}
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
              <h2 className="font-semibold text-lg text-white">Project Chat</h2>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <Chat user={authUser} projectId={projectId} />
          </div>
        )}
      </div>
    </>
    );
  }

  export default CodeEditor;