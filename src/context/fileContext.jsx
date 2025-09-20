import { createContext, useState, useRef } from "react";

export const FileUtilsContext = createContext();

export const FileUtilsProvider = ({ children }) => {
  // ---------- States ----------
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
  const [status, setStatus] = useState("");
  const [activeFileId, setActiveFileId] = useState(initialProject.files[0].id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExtension, setNewFileExtension] = useState('html');

  // ---------- Refs ----------
  const monacoEditorRef = useRef(null);
  //   const monacoInstanceRef = useRef(null);
  const contentChangeTimeoutRef = useRef(null);

  // ---------- Context value ----------
  const value = {
    project,
    setProject,
    status,
    setStatus,
    activeFileId,
    setActiveFileId,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isAddingFile,
    setIsAddingFile,
    isSaving,
    setIsSaving,
    isUploading,
    setIsUploading,
    selectedFiles,
    setSelectedFiles,
    monacoEditorRef,
    contentChangeTimeoutRef,
    newFileName,          // ضيف دول
    setNewFileName,
    newFileExtension,
    setNewFileExtension,
  };

  return (
    <FileUtilsContext.Provider value={value}>
      {children}
    </FileUtilsContext.Provider>
  );
};
