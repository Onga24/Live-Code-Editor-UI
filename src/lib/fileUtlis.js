// تحديث fileUtlis.js النهائي مع Real-time Support

import { FileUtilsContext } from "../context/fileContext";

// Modified save function with real-time broadcasting
export const handleSave = async (ctx, apiRequest) => {
    const { project, setProject, setStatus, setIsSaving, authUser } = ctx;
    if (!project?.id) {
        setStatus('No project ID available');
        setTimeout(() => setStatus(''), 3000);
        return;
    }

    setIsSaving(true);
    setStatus('Saving...');
    scrollToTop();

    try {
        const filesData = project.files.map(file => ({
            name: file.name,
            content: file.content,
            id: file.id?.toString().replace('file', '') || null
        }));

        const response = await apiRequest(`/projects/${project.id}/files`, 'POST', {
            files: filesData
        });

        if (response.success) {
            if (response.files) {
                setProject(prev => ({
                    ...prev,
                    files: prev.files.map((file, index) => {
                        const backendFile = response.files[index];
                        return {
                            ...file,
                            id: backendFile?.id ? `file${backendFile.id}` : file.id,
                            lastUpdatedBy: authUser?.id // Track who saved
                        };
                    })
                }));
            }

            setStatus('Saved successfully!');
            
            // Send notification to other users
            if (window.Echo && project.id) {
                const channel = window.Echo.private(`project.${project.id}`);
                channel.whisper('project-saved', {
                    user_id: authUser?.id,
                    user_name: authUser?.name,
                    saved_files: filesData.length,
                    timestamp: new Date().toISOString()
                });
            }
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

// Enhanced file creation with real-time updates
export const handleCreateFile = (ctx, apiRequest) => {
    const {
        setProject, setStatus, newFileName, setNewFileName,
        newFileExtension, project, setIsAddingFile, authUser
    } = ctx;
    
    if (!newFileName.trim()) return;

    const fullFileName = `${newFileName.trim()}.${newFileExtension}`;
    const isFileExists = project.files.some(file => file.name === fullFileName);

    if (isFileExists) {
        setStatus(`Error: A file named "${fullFileName}" already exists.`);
        setTimeout(() => setStatus(''), 3000);
        return;
    }

    const newFile = {
        id: `file${Date.now()}`,
        name: fullFileName,
        content: getDefaultContent(fullFileName.split('.').pop()),
        createdBy: authUser?.id,
        lastUpdatedBy: authUser?.id,
        isNew: true // Mark as new for UI feedback
    };

    setProject(prevProject => ({
        ...prevProject,
        files: [...prevProject.files, newFile],
    }));

    handleFileSwitch(ctx, newFile.id);
    setIsAddingFile(false);
    setNewFileName('');
    scrollToTop();
    
    // Broadcast file creation
    if (window.Echo && project.id) {
        const channel = window.Echo.private(`project.${project.id}`);
        channel.whisper('file-created', {
            user_id: authUser?.id,
            user_name: authUser?.name,
            file_name: fullFileName,
            file_id: newFile.id,
            timestamp: new Date().toISOString()
        });
    }
    
    setStatus(`Created ${fullFileName}`);
    setTimeout(() => {
        setStatus('');
        // Remove "new" flag after animation
        setProject(prev => ({
            ...prev,
            files: prev.files.map(f => 
                f.id === newFile.id ? {...f, isNew: false} : f
            )
        }));
    }, 2000);
};

// Real-time aware file upload
export const handleFileUpload = async (ctx, event, apiRequest, loadProject) => {
    const { project, setStatus, setIsUploading, authUser } = ctx;
    const files = Array.from(event.target.files);
    if (!files.length || !project.id) return;

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

    if (newFiles.length === 0) {
        setStatus(`Error: The following file(s) already exist: ${duplicateFileNames.join(', ')}`);
        setTimeout(() => setStatus(''), 3000);
        event.target.value = '';
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

            // Broadcast file upload
            if (window.Echo) {
                const channel = window.Echo.private(`project.${project.id}`);
                channel.whisper('files-uploaded', {
                    user_id: authUser?.id,
                    user_name: authUser?.name,
                    uploaded_files: newFiles.map(f => f.name),
                    duplicate_files: duplicateFileNames,
                    timestamp: new Date().toISOString()
                });
            }

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
        event.target.value = '';
    }
};

// Enhanced delete with real-time sync
export const handleDeleteFile = async (ctx, fileId, apiRequest) => {
    const {project, setProject, setStatus, setShowDeleteConfirm, activeFileId, authUser} = ctx;
    
    // Handle temporary files (client-side only)
    if (fileId.startsWith('file') && !fileId.match(/^file\d+$/)) {
        const fileToDelete = project.files.find(f => f.id === fileId);
        if (fileToDelete) {
            setProject(prev => ({
                ...prev,
                files: prev.files.filter(file => file.id !== fileId)
            }));
            
            // Broadcast temporary file deletion
            if (window.Echo && project.id) {
                const channel = window.Echo.private(`project.${project.id}`);
                channel.whisper('temp-file-deleted', {
                    user_id: authUser?.id,
                    user_name: authUser?.name,
                    file_name: fileToDelete.name,
                    file_id: fileId,
                    timestamp: new Date().toISOString()
                });
            }
            
            setStatus(`Deleted: ${fileToDelete.name}`);
        }
        setTimeout(() => setStatus(''), 3000);
        setShowDeleteConfirm(null);
        return;
    }
    
    if (!project.id) {
        setStatus('Error: Project ID is missing.');
        setTimeout(() => setStatus(''), 3000);
        return;
    }
    
    const fileToDelete = project.files.find(f => f.id === fileId);
    const backendFileId = fileId.toString().replace('file', '');
    
    try {
        const response = await apiRequest(`/projects/${project.id}/files/${backendFileId}`, 'DELETE');

        if (response.success) {
            const deletedFileIndex = project.files.findIndex(f => f.id === fileId);
            const updatedFiles = project.files.filter(file => file.id !== fileId);
            
            setProject(prevProject => ({
                ...prevProject,
                files: updatedFiles
            }));
            scrollToTop();

            if (fileId === activeFileId) {
                let newActiveFileId;
                if (deletedFileIndex > 0) {
                    newActiveFileId = project.files[deletedFileIndex - 1].id;
                } else {
                    newActiveFileId = updatedFiles[0]?.id;
                }
                if (newActiveFileId) {
                    handleFileSwitch(ctx, newActiveFileId);
                }
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

// Utility functions
const getDefaultContent = (ext) => {
    switch (ext) {
        case "js":
            return "// Start coding in JavaScript...\nconsole.log('Hello World!');\n";
        case "html":
            return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>New File</title>\n</head>\n<body>\n    <h1>Welcome!</h1>\n</body>\n</html>";
        case "css":
            return "/* Start styling here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n";
        case "py":
            return "# Python script\nprint('Hello World!')\n";
        case "json":
            return "{\n    \"name\": \"new-project\",\n    \"version\": \"1.0.0\"\n}";
        case "md":
            return "# New Document\n\nStart writing your markdown here...\n";
        case "txt":
            return "Start writing here...\n";
        default:
            return "// New file created\n";
    }
};

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

export const handleFileSwitch = (ctx, newFileId) => {
    const { monacoEditorRef, activeFileId, setActiveFileId, setProject, contentChangeTimeoutRef, authUser, project } = ctx;
    
    if (!monacoEditorRef?.current) return;
    
    // Save current content before switching
    if (monacoEditorRef.current && activeFileId !== newFileId) {
        const currentContent = monacoEditorRef.current.getValue();
        setProject(prevProject => {
            const newFiles = prevProject.files.map(file =>
                file.id === activeFileId ? { ...file, content: currentContent, lastUpdatedBy: authUser?.id } : file
            );
            return { ...prevProject, files: newFiles };
        });

        if (contentChangeTimeoutRef.current) {
            clearTimeout(contentChangeTimeoutRef.current);
            contentChangeTimeoutRef.current = null;
        }
        
        // Broadcast file switch (stop editing previous file)
        if (window.Echo && project.id && activeFileId) {
            const channel = window.Echo.private(`project.${project.id}`);
            channel.whisper('editing-stop', {
                user_id: authUser?.id,
                user_name: authUser?.name,
                file_id: activeFileId,
                timestamp: new Date().toISOString()
            });
        }
    }

    setActiveFileId(newFileId);
    
    // Broadcast new file editing
    if (window.Echo && project.id && newFileId) {
        const channel = window.Echo.private(`project.${project.id}`);
        channel.whisper('editing-start', {
            user_id: authUser?.id,
            user_name: authUser?.name,
            file_id: newFileId,
            timestamp: new Date().toISOString()
        });
    }
};

// Enhanced multiple file deletion
export const handleDeleteMultipleFiles = async (ctx, apiRequest) => {
    const {selectedFiles, setProject, project, activeFileId, setStatus, setSelectedFiles, authUser } = ctx;
    
    if (!selectedFiles.length || !project.id) return;

    if (selectedFiles.length === project.files.length) {
        setStatus("You can't delete all files. At least one file must remain.");
        setTimeout(() => setStatus(''), 3000);
        return;
    }

    const filesToDeleteFromBackend = [];
    const filesToDeleteFromFrontend = [];

    selectedFiles.forEach(id => {
        if (id.startsWith('file') && !id.match(/^file\d+$/)) {
            filesToDeleteFromFrontend.push(id);
        } else {
            filesToDeleteFromBackend.push(id.toString().replace('file', ''));
        }
    });

    try {
        if (filesToDeleteFromBackend.length > 0) {
            const response = await apiRequest(`/projects/${project.id}/files`, 'DELETE', {
                file_ids: filesToDeleteFromBackend
            });

            if (!response.success) {
                setStatus('Delete failed: ' + (response.message || 'Unknown error'));
                return;
            }
        }

        const allFilesToDelete = [...filesToDeleteFromBackend.map(id => `file${id}`), ...filesToDeleteFromFrontend];
        const deletedFileNames = project.files
            .filter(file => allFilesToDelete.includes(file.id))
            .map(file => file.name);

        setProject(prevProject => ({
            ...prevProject,
            files: prevProject.files.filter(file => !allFilesToDelete.includes(file.id))
        }));

        if (allFilesToDelete.includes(activeFileId)) {
            const remainingFiles = project.files.filter(file => !allFilesToDelete.includes(file.id));
            if (remainingFiles.length > 0) {
                handleFileSwitch(ctx, remainingFiles[0].id);
            }
        }

        // Broadcast multiple file deletion
        if (window.Echo && project.id) {
            const channel = window.Echo.private(`project.${project.id}`);
            channel.whisper('multiple-files-deleted', {
                user_id: authUser?.id,
                user_name: authUser?.name,
                deleted_files: deletedFileNames,
                count: allFilesToDelete.length,
                timestamp: new Date().toISOString()
            });
        }

        scrollToTop();
        setStatus(`Deleted ${allFilesToDelete.length} file(s) successfully`);
        setSelectedFiles([]);
        setTimeout(() => setStatus(''), 3000);
        
    } catch (error) {
        console.error('Delete error:', error);
        setStatus('Error deleting files');
        setTimeout(() => setStatus(''), 3000);
    }
};