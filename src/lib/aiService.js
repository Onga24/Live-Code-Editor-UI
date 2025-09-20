// src/lib/aiService.js
export async function getAIResponse(message, currentFile, allFiles) {
  try {
    const res = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, currentFile, allFiles }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("AI RAW Response:", data);

    // استخراج النص من استجابة OpenAI
    const text =
      data?.output?.[0]?.content?.[0]?.text ||
      data?.choices?.[0]?.message?.content ||
      "⚠️ الرد فاضي";

    return text;
  } catch (error) {
    console.error("AI Error:", error);
    return "⚠️ حصل خطأ في الاتصال بالسيرفر.";
  }
}


  // AI-powered code assistance
  export const getAiCodeSuggestions = async (code, language, action = 'improve') => {
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
  export const handleAiCompletion = async () => {
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
  export const handleAiImprove = async () => {
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
  export const applyAiSuggestion = (suggestion) => {
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
