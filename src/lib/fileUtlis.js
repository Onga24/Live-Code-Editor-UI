import { FileUtilsContext } from "../context/fileContext";

// Fixed save function
export const handleSave = async (ctx) => {
    const { project, setProject, setStatus, setIsSaving } = ctx;
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

const getDefaultContent = (ext) => {
    switch (ext) {
        case "js":
            return "// Start coding in JavaScript...\n";
        case "html":
            return "<!DOCTYPE html>\n<html>\n<head>\n  <title>New File</title>\n</head>\n<body>\n\n</body>\n</html>";
        case "css":
            return "/* Start styling here */\n";
        case "json":
            return "{\n  \n}";
        default:
            return "";
    }
};

export const handleCreateFile = (ctx) => {
    const {
        setProject, setStatus, newFileName, setNewFileName,
        newFileExtension, monacoEditorRef, activeFileId, setActiveFileId,
        project, setIsAddingFile
    } = ctx;
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
        content: getDefaultContent(fullFileName.split('.').pop()),
    };

    setProject(prevProject => ({
        ...prevProject,
        files: [...prevProject.files, newFile],
    }));

    handleFileSwitch(ctx, 0);
    setIsAddingFile(false);
    setNewFileName('');
    scrollToTop();
    setStatus(`Created ${fullFileName}`);
    setTimeout(() => setStatus(''), 2000);
};

// File upload functionality
export const handleFileUpload = async (ctx, event, apiRequest, loadProject) => {
    const { project, setStatus, setIsUploading } = ctx;
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

export const deleteFile = async (ctx, fileId) => {
    const { project, setProject, setStatus, activeFileId } = ctx;
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
        console.log('deleteFile', numericFileId);
        const response = await apiRequest(`/projects/${project.id}/files/${numericFileId}`, 'DELETE');
        console.log(response);
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
                    handleFileSwitch(ctx, remainingFiles[0].id);
                }
            }
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

export const handleDeleteFile = async (ctx, fileId) => {
    const {project, setProject, setStatus, setShowDeleteConfirm, activeFileId} = ctx;
    if (fileId.startsWith('file')) {
        const fileToDelete = project.files.find(f => f.id === fileId);
        if (fileToDelete) {
            setProject(prev => ({
                ...prev,
                files: prev.files.filter(file => file.id !== fileId)
            }));
            console.log(fileToDelete);
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
                handleFileSwitch(ctx, newActiveFileId);

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

export const handleDeleteMultipleFiles = async (ctx) => {
    const {selectedFiles, setProject, project, activeFileId, setStatus, setSelectedFiles } = ctx;
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
            handleFileSwitch(ctx, remainingFiles[0].id);
        }
    }

    scrollToTop();
    setStatus(`Deleted ${allFilesToDelete.length} file(s) successfully`);
    setSelectedFiles([]);
    setTimeout(() => setStatus(''), 3000);
};

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // This makes the scroll animated, which is a nice touch
    });
};

export const handleFileSwitch = (ctx, newFileId) => {
    const { monacoEditorRef, activeFileId, setActiveFileId, setProject, contentChangeTimeoutRef } = ctx;
    // monacoEditorRef, activeFileId, setActiveFileId
    // Save current file content if Monaco editor exists
    if (!monacoEditorRef?.current) return;
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