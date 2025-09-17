import { MessageSquare, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import Chat from './Chat';
import ChatAssistant from './ChatAssistant';
import { getLanguageFromExtension, getDefaultContent , FileTextIcon} from "../lib/codeUtils.jsx"; // هنفصل uti
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Send, Bot, User, Lightbulb, Bug, Code, Upload, Trash2, X } from 'lucide-react';
import { AuthContext } from "../context/AuthContext"; // Add this import
import { v4 as uuidv4 } from 'uuid';
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
    'html': 'html', 'htm': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'sass',
    'less': 'less', 'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript',
    'tsx': 'typescript', 'json': 'json', 'xml': 'xml', 'py': 'python',
    'php': 'php', 'java': 'java', 'c': 'c', 'cpp': 'cpp', 'cs': 'csharp',
    'go': 'go', 'rs': 'rust', 'rb': 'ruby', 'swift': 'swift', 'kt': 'kotlin',
    'scala': 'scala', 'sh': 'shell', 'bash': 'shell', 'yml': 'yaml',
    'yaml': 'yaml', 'toml': 'toml', 'ini': 'ini', 'conf': 'ini',
    'md': 'markdown', 'markdown': 'markdown', 'tex': 'latex', 'sql': 'sql',
    'txt': 'plaintext', 'log': 'plaintext'
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

function CodeEditor() {
  const { apiRequest } = useContext(AuthContext); // Get apiRequest from context
  
  const initialProject = {
    id: null, // Will be set from URL params
    title: 'Collaborative App',
    files: [
      { 
        id: 'file1', 
        name: 'index.html', 
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Hello World</title>\n</head>\n<body>\n    <div>\n        <h1>🚀 Welcome to the Code Editor!</h1>\n        <p>This is a collaborative coding environment.</p>\n    </div>\n</body>\n</html>' 




 
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Chat-related state
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


  const activeFile = project.files.find(f => f.id === activeFileId);
  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const contentChangeTimeoutRef = useRef(null);
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

  // Fixed save function
  const handleSave = async () => {
    if (!project.id) {
      setStatus('No project ID available');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setIsSaving(true);
    setStatus('Saving...');
    scrollToTop();

    try {
      // Prepare files data for backend
      const filesData = project.files.map(file => ({
        name: file.name,
        content: file.content,
        // Include file ID if it exists for updates
        id: file.id?.toString().replace('file', '') || null
      }));

      const response = await apiRequest(`/projects/${project.id}/files`, 'POST', {
        files: filesData
      });
      
      if (response.success) {
        // Update file IDs if new ones were created
        if (response.files) {
          setProject(prev => ({
            ...prev,
            files: prev.files.map((file, index) => {
              const backendFile = response.files[index];
              return {
                ...file,
                id: backendFile?.id ? `file${backendFile.id}` : file.id
              };
            })
          }));
        }
        
        setStatus('Saved successfully!');
      } else {
        setStatus('Save failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      setStatus('Error saving project');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

const handleCreateFile = () => {
    if (!newFileName.trim()) return;

    const fullFileName = `${newFileName.trim()}.${newFileExtension}`;

    // Check if a file with the same name already exists
    const isFileExists = project.files.some(file => file.name === fullFileName);

    if (isFileExists) {
        setStatus(`Error: A file named "${fullFileName}" already exists.`);
        setTimeout(() => setStatus(''), 3000);
        return; // Stop the function from creating the duplicate file
    }

    const newFile = {
        id: `file${Date.now()}`,
        name: fullFileName,
        content: getDefaultContent(fullFileName),
    };

    setProject(prevProject => ({
        ...prevProject,
        files: [...prevProject.files, newFile],
    }));

    handleFileSwitch(newFile.id);
    setIsAddingFile(false);
    setNewFileName('');
    scrollToTop();
    setStatus(`Created ${fullFileName}`);
    setTimeout(() => setStatus(''), 2000);
};

  // File upload functionality
const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files);
  if (!files.length || !project.id) return;

  // 1. Check for duplicate file names before uploading
  const existingFileNames = new Set(project.files.map(file => file.name));
  const newFiles = [];
  const duplicateFileNames = [];

  for (const file of files) {
    if (existingFileNames.has(file.name)) {
      duplicateFileNames.push(file.name);
    } else {
      newFiles.push(file);
    }
  }

  // Handle the case where all selected files are duplicates
  if (newFiles.length === 0) {
    setStatus(`Error: The following file(s) already exist: ${duplicateFileNames.join(', ')}`);
    setTimeout(() => setStatus(''), 3000);
    event.target.value = ''; // Reset file input
    return;
  }

  setIsUploading(true);
  setStatus('Uploading files...');

  try {
    const formData = new FormData();
    newFiles.forEach(file => {
      formData.append('files[]', file);
    });

    const response = await apiRequest(
      `/projects/${project.id}/files/upload`,
      'POST',
      formData
    );

    if (response.success) {
      await loadProject(project.id);
      
      // Provide a clear status message, mentioning if duplicates were skipped
      if (duplicateFileNames.length > 0) {
        setStatus(`Uploaded ${newFiles.length} file(s) successfully. Skipped duplicates: ${duplicateFileNames.join(', ')}`);
      } else {
        setStatus(`Uploaded ${newFiles.length} file(s) successfully!`);

      }

      scrollToTop();
    } else {
      setStatus('Upload failed: ' + (response.message || 'Unknown error'));
      scrollToTop();
    }
  } catch (error) {
    console.error('Upload error:', error);
    setStatus(`Error uploading files: ${error.message}`);
  } finally {
    setIsUploading(false);
    setTimeout(() => setStatus(''), 3000);
    event.target.value = ''; // Reset file input
  }
};


// const handleFileUpload = async (event) => {
//   const files = Array.from(event.target.files);
//   if (!files.length || !project.id) return;

//   setIsUploading(true);
//   setStatus('Uploading files...');

//   try {
//     const formData = new FormData();
//     files.forEach(file => {
//       formData.append('files[]', file);
//     });

//     // Pass FormData directly to apiRequest
//     const response = await apiRequest(
//       `/projects/${project.id}/files/upload`,
//       'POST',
//       formData // Pass the FormData object here
//     );

//     // Assuming your API returns { success: true, files: [...] } on success
//     if (response.success) {
//       await loadProject(project.id); // Make sure loadProject also uses apiRequest or handles auth
//       setStatus(`Uploaded ${response.files.length} file(s) successfully!`);
//       scrollToTop();
//     } else {
//       // Handle cases where the API returns a success: false but a 2xx status
//       setStatus('Upload failed: ' + (response.message || 'Unknown error'));
//       scrollToTop();

//     }
//   } catch (error) {
//     console.error('Upload error:', error);
//     setStatus(`Error uploading files: ${error.message}`);
//   } finally {
//     setIsUploading(false);
//     setTimeout(() => setStatus(''), 3000);
//     event.target.value = ''; // Reset file input
//   }
// };

  const deleteFile = async (fileId) => {
    // 1. Initial State & Safety Check
    if (project.files.length <= 1) {
        setStatus('Cannot delete the last file');
        setTimeout(() => setStatus(''), 2000);
        return;
    }
    setStatus('Deleting file...');

    try {
        // 2. Prepare and Send API Request
        // Your file IDs are like 'file123', so remove the 'file' prefix for the backend
        const numericFileId = fileId.toString().replace('file', '');

        const response = await apiRequest(`/projects/${project.id}/files/${numericFileId}`, 'DELETE');

        // 3. Handle a Successful Response
        if (response.success) {
            // Update the state using a functional update
            setProject(prevProject => {
                // Filter out the deleted file to create a new array
                const updatedFiles = prevProject.files.filter(file => file.id !== fileId);

                // If the deleted file was the active one, switch to another file
                let newActiveFileId = prevProject.activeFileId;
                if (prevProject.activeFileId === fileId && updatedFiles.length > 0) {
                    newActiveFileId = updatedFiles[0].id;
                }

                // Return the new state object
                return {
                    ...prevProject,
                    files: updatedFiles,
                    activeFileId: newActiveFileId
                };
            });

            setStatus('File deleted successfully!');
                    if (fileId === activeFileId) {
          const remainingFiles = project.files.filter(file => file.id !== fileId);
          if (remainingFiles.length > 0) {
            handleFileSwitch(remainingFiles[0].id);
          }}
        else {
            setStatus('Delete failed: ' + (response.message || 'Unknown error'));
        }


        } else {
            // 4. Handle a Failed Response
            setStatus('Delete failed: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        // 5. Handle Network or Unexpected Errors
        console.error('Delete error:', error);
        setStatus('Error deleting file');
    } finally {
        // 6. Clean Up
        setTimeout(() => setStatus(''), 3000);
    }
};
  // File deletion functionality
//   const handleDeleteFile = async (fileId) => {
//     if (!project.id) return;

//     const fileToDelete = project.files.find(f => f.id === fileId);
//     const backendFileId = fileId.toString().replace('file', '');

//     try {
//       const response = await apiRequest(`/projects/${project.id}/files/${backendFileId}`, 'DELETE');

//       if (response.success) {
//         // Force reload project to sync with backend
//         await loadProject(project.id);
//         setStatus(`Deleted ${fileToDelete?.name || 'file'} successfully`);
//       } else {
//         setStatus('Delete failed: ' + (response.message || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       setStatus('Error deleting file');
//     } finally {
//       setTimeout(() => setStatus(''), 3000);
//       setShowDeleteConfirm(null);
//     }
//   };

const handleDeleteFile = async (fileId) => {
     if (fileId.startsWith('file')) {
        const fileToDelete = project.files.find(f => f.id === fileId);
        if (fileToDelete) {
            setProject(prev => ({
                ...prev,
                files: prev.files.filter(file => file.id !== fileId)
            }));
            setStatus(`deleted: ${fileToDelete.name}`);
        }
        setTimeout(() => setStatus(''), 3000);
        setShowDeleteConfirm(null);
        return; // This is the crucial part: prevent the API call
    }
    // The rest of your function remains the same
    if (!project.id) {
        setStatus('Error: Project ID is missing.');
        setTimeout(() => setStatus(''), 3000);
        return;
    }
    const fileToDelete = project.files.find(f => f.id === fileId);
    const backendFileId = fileId; // This is now a numeric/database ID
    try {
        const response = await apiRequest(`/projects/${project.id}/files/${backendFileId}`, 'DELETE');

        if (response.success) {
            // Find the index of the file being deleted
            const deletedFileIndex = project.files.findIndex(f => f.id === fileId);
            
            // Remove the file from the frontend state
            const updatedFiles = project.files.filter(file => file.id !== fileId);
            setProject(prevProject => ({
                ...prevProject,
                files: updatedFiles
            }));
scrollToTop();
            
            // 4. Switch to the previous file if the active one was deleted
            if (fileId === activeFileId) {
                let newActiveFileId;
                if (deletedFileIndex > 0) {
                    // Switch to the previous file in the original array
                    newActiveFileId = project.files[deletedFileIndex - 1].id;
                } else {
                    // If the first file was deleted, switch to the new first file
                    newActiveFileId = updatedFiles[0].id;
                }
                handleFileSwitch(newActiveFileId);
                
            }
            
            setStatus(`Deleted ${fileToDelete?.name || 'file'} successfully`);
        } else {
            setStatus('Delete failed: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Delete error:', error);
        setStatus('Error deleting file');
    } finally {
        setTimeout(() => setStatus(''), 3000);
        setShowDeleteConfirm(null);
    }
};


  // Multiple file deletion
//   const handleDeleteMultipleFiles = async () => {
//     if (!selectedFiles.length || !project.id) return;

//     const backendFileIds = selectedFiles.map(id => id.toString().replace('file', ''));

//     try {
//       const response = await apiRequest(`/projects/${project.id}/files`, 'DELETE', {
//         file_ids: backendFileIds
//       });

//       if (response.success) {
//         // Remove files from frontend state
//         setProject(prevProject => ({
//           ...prevProject,
//           files: prevProject.files.filter(file => !selectedFiles.includes(file.id))
//         }));

//         // Switch to another file if active file was deleted
//         if (selectedFiles.includes(activeFileId)) {
//           const remainingFiles = project.files.filter(file => !selectedFiles.includes(file.id));
//           if (remainingFiles.length > 0) {
//             handleFileSwitch(remainingFiles[0].id);
//           }
//         }

//         setStatus(`Deleted ${selectedFiles.length} file(s) successfully`);
//         setSelectedFiles([]);
//       } else {
//         setStatus('Delete failed: ' + (response.message || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       setStatus('Error deleting files');
//     } finally {
//       setTimeout(() => setStatus(''), 3000);
//     }
//   };

const handleDeleteMultipleFiles = async () => {
    if (!selectedFiles.length || !project.id) return;

    // Condition to prevent deleting all files
    if (selectedFiles.length === project.files.length) {
        setStatus("You can't delete all files. At least one file must remain.");
        setTimeout(() => setStatus(''), 3000);
        return;
    }

    // Separate files into temporary (unsaved) and permanent (saved)
    const filesToDeleteFromBackend = [];
    const filesToDeleteFromFrontend = [];

    selectedFiles.forEach(id => {
        if (id.startsWith('file')) {
            filesToDeleteFromFrontend.push(id);
        } else {
            filesToDeleteFromBackend.push(id);
        }
    });

    // Handle deletion of permanent files from the backend
    if (filesToDeleteFromBackend.length > 0) {
        try {
            const response = await apiRequest(`/projects/${project.id}/files`, 'DELETE', {
                file_ids: filesToDeleteFromBackend
            });

            if (!response.success) {
                setStatus('Delete failed: ' + (response.message || 'Unknown error'));
                return; // Stop if the backend deletion failed
            }
        } catch (error) {
            console.error('Delete error:', error);
            setStatus('Error deleting files from backend');
            return;
        }
    }

    // Now, handle the front-end state for both temporary and permanent files
    const allFilesToDelete = [...filesToDeleteFromBackend, ...filesToDeleteFromFrontend];

    // Remove files from frontend state
    setProject(prevProject => ({
        ...prevProject,
        files: prevProject.files.filter(file => !allFilesToDelete.includes(file.id))
    }));
    
    // Switch to another file if active file was deleted
    if (allFilesToDelete.includes(activeFileId)) {
        const remainingFiles = project.files.filter(file => !allFilesToDelete.includes(file.id));
        if (remainingFiles.length > 0) {
            handleFileSwitch(remainingFiles[0].id);
        }
    }
    
    scrollToTop();
    setStatus(`Deleted ${allFilesToDelete.length} file(s) successfully`);
    setSelectedFiles([]);
    setTimeout(() => setStatus(''), 3000);
};

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // This makes the scroll animated, which is a nice touch
    });
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

  const handleFileSwitch = (newFileId) => {
    // Save current file content if Monaco editor exists
    if (monacoEditorRef.current && activeFileId !== newFileId) {
      const currentContent = monacoEditorRef.current.getValue();
      setProject(prevProject => {
        const newFiles = prevProject.files.map(file =>
          file.id === activeFileId ? { ...file, content: currentContent } : file
        );
        return { ...prevProject, files: newFiles };
      });
      
      // Clear any pending timeouts
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
        contentChangeTimeoutRef.current = null;
      }
    }
    
    setActiveFileId(newFileId);
  };
  // AI-powered code assistance
  const getAiCodeSuggestions = async (code, language, action = 'improve') => {
    setIsLoadingAi(true);
    try {
      const response = await apiRequest('/ai/code-assist', 'POST', {
        code: code,
        language: language,
        action: action, // 'improve', 'explain', 'debug', 'complete'
        context: {
          filename: activeFile?.name,
          projectFiles: project.files.map(f => ({ name: f.name, language: getLanguageFromExtension(f.name) }))
        }
      });

      if (response.success) {
        return response.suggestions || [];
      }
      return [];
    } catch (error) {
      console.error('AI assistance error:', error);
      return [];
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Handle AI code completion
  const handleAiCompletion = async () => {
    if (!monacoEditorRef.current || !activeFile) return;

    const position = monacoEditorRef.current.getPosition();
    const model = monacoEditorRef.current.getModel();
    const currentLine = model.getLineContent(position.lineNumber);
    const codeContext = model.getValueInRange({
      startLineNumber: Math.max(1, position.lineNumber - 10),
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const suggestions = await getAiCodeSuggestions(
      codeContext, 
      getLanguageFromExtension(activeFile.name), 
      'complete'
    );

    if (suggestions.length > 0) {
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
    }
  };

  // Handle AI code improvement
  const handleAiImprove = async () => {
    if (!monacoEditorRef.current || !activeFile) return;

    const selection = monacoEditorRef.current.getSelection();
    let code = monacoEditorRef.current.getModel().getValueInRange(selection);
    
    if (!code.trim()) {
      code = monacoEditorRef.current.getValue(); // Use entire file if no selection
    }

    const suggestions = await getAiCodeSuggestions(
      code, 
      getLanguageFromExtension(activeFile.name), 
      'improve'
    );

    if (suggestions.length > 0) {
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
    }
  };

  // Apply AI suggestion
  const applyAiSuggestion = (suggestion) => {
    if (!monacoEditorRef.current) return;

    const selection = monacoEditorRef.current.getSelection();
    const hasSelection = !selection.isEmpty();

    if (hasSelection) {
      monacoEditorRef.current.executeEdits('ai-suggestion', [{
        range: selection,
        text: suggestion.code
      }]);
    } else if (suggestion.insertAt === 'cursor') {
      const position = monacoEditorRef.current.getPosition();
      monacoEditorRef.current.executeEdits('ai-suggestion', [{
        range: { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column },
        text: suggestion.code
      }]);
    } else {
      // Replace entire content
      monacoEditorRef.current.setValue(suggestion.code);
    }

    setShowAiSuggestions(false);
    setAiSuggestions([]);
  };

  return (
       <div className="min-h-screen bg-dark-gray text-gray-200 p-4 md:p-8 flex flex-col " style={{backgroundColor:'#101828'}}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-50">
          <span className="text-sky-400">Project:</span> {project.title}
        </h1>
        <div className="flex items-center space-x-4">
          <span className={`text-sm px-3 py-1 rounded-full ${
            status.includes('Saved') || status.includes('loaded') ? 'bg-green-900 text-green-200' :
            status.includes('Created') ? 'bg-blue-900 text-blue-200' :
            status.includes('deleted') ? 'bg-red-900 text-red-200' :
            status.includes('Error') || status.includes('failed') ? 'bg-red-900 text-red-200' :
            'text-gray-400'
          }`}>
            {status || 'Ready'}
          </span>
          <button
            onClick={handleSave} 
            disabled={isSaving || !project.id}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              isSaving || !project.id
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            + New File
          </button>
        </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* File Explorer */}
        <div className="lg:w-1/4 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-50">Files</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingFile(true)}
                className="px-2 py-1 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-all"
                title="Create New File"
              >
                + New
              </button>
              
              <label className="px-2 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all cursor-pointer">
                <Upload className="h-4 w-4 inline mr-1" />
                Upload
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || !project.id}
                />
              </label>
              
              {selectedFiles.length > 0 && (
                <button
                  onClick={handleDeleteMultipleFiles}
                  className="px-2 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all"
                  title={`Delete ${selectedFiles.length} selected file(s)`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* File selection controls */}
          {project.files.length > 1 && (
            <div className="flex justify-between items-center mb-3 text-sm text-gray-400">
              <span>{selectedFiles.length} selected</span>
              <div className="space-x-2">
                <button
                  onClick={() => setSelectedFiles(project.files.map(f => f.id))}
                  className="hover:text-sky-400"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="hover:text-sky-400"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Add File Form */}
          {isAddingFile && (
            <div className="flex flex-col space-y-3 mb-4 p-3 bg-gray-700 rounded-lg">
              <input
                type="text"
                placeholder="Enter file name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              />
              <select
                value={newFileExtension}
                onChange={(e) => setNewFileExtension(e.target.value)}
                className="w-full p-2 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
            file.id === activeFileId
              ? 'bg-sky-600 text-white shadow-lg'
              : selectedFiles.includes(file.id)
              ? 'bg-gray-700 ring-2 ring-sky-500'
              : 'hover:bg-gray-700'
          }`}
        >
          {/* File selection checkbox */}
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
              className="rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div
            className="flex items-center space-x-2 flex-1"
            onClick={() => handleFileSwitch(file.id)}
          >
            <FileTextIcon />
            <span className="truncate">{file.name}</span>
          </div>

          {project.files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(file.id);
                // deleteFile(file.id);
                handleDeleteFile(file.id);
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
    {/* Remove the malformed tag here */}
</div>
        {/* Editor */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <label className="text-lg font-semibold text-gray-50">
                Code Editor: {activeFile?.name}
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  Language: {getLanguageFromExtension(activeFile?.name || '')}
                </span>
                
                {/* AI Toolbar */}
                {/* <div className="flex space-x-1">
                  <button
                    onClick={handleAiCompletion}
                    disabled={isLoadingAi}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50 transition-all"
                    title="AI Completion (Ctrl+Space)"
                  >
                    {isLoadingAi ? '...' : '🤖 Complete'}
                  </button>
                  <button
                    onClick={handleAiImprove}
                    disabled={isLoadingAi}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-all"
                    title="AI Improve (Ctrl+Shift+I)"
                  >
                    ✨ Improve
                  </button>
                </div> */}
              </div>
            </div>
            
            {/* AI Suggestions Panel */}
            {showAiSuggestions && aiSuggestions.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 max-h-64 overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-white">AI Suggestions</h4>
                  <button
                    onClick={() => setShowAiSuggestions(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-400">
                          {suggestion.title || `Suggestion ${index + 1}`}
                        </span>
                        <button
                          onClick={() => applyAiSuggestion(suggestion)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                      {suggestion.description && (
                        <p className="text-xs text-gray-300 mb-2">{suggestion.description}</p>
                      )}
                      <pre className="bg-gray-800 p-2 rounded text-xs text-gray-200 overflow-x-auto">
                        <code>{suggestion.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-gray-700">
              <div ref={editorRef} className="w-full h-full" />
            </div>
            
            {/* Quick AI Actions Bar */}
            <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
              <div className="flex space-x-4">
               
                {selectedText && <span>Selection: {selectedText.length} chars</span>}
              </div>
              <div className="flex items-center space-x-2">
                {isLoadingAi && <span>AI processing...</span>}
                <span>Lines: {activeFile?.content.split('\n').length || 0}</span>
              </div>
            </div>
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