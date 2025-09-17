import React, { useState, useEffect, useRef } from "react";

import { Send, Bot, User, Lightbulb, Bug, Code, Sparkles } from 'lucide-react';
// import { Bot, User, Send, Lightbulb, Bug, Code } from "lucide-react";

import { getAIResponse } from "../lib/aiService";


const ChatAssistant = () => {
    const [chatInput, setChatInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // open ai
    const getDynamicAIResponse = async (message, currentFile, allFiles) => {
        return await getAIResponse(message, currentFile, allFiles);
    };

    // Auto-scroll chat to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Chat-related state
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            message: '👋 Hello! I\'m your AI coding assistant. I can help you analyze code, debug issues, provide tips, and answer programming questions. What would you like to work on?',
            timestamp: new Date()
        }
    ]);

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

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

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
            // const aiResponse = getDynamicAIResponse(chatInput, activeFile, project.files);
            let aiResponse;
            try {
                aiResponse = getDynamicAIResponse(chatInput, activeFile, project.files);
            } catch (error) {
                aiResponse = getStaticAIResponse(chatInput, activeFile, project.files);
            }
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
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col" style={{ height: '400px' }}>
            {/* AI Chat Assistant Header */}
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
                        className={`flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-sky-600' : 'bg-gray-700'}`}>
                            {msg.type === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-sky-400" />}
                        </div>
                        <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${msg.type === 'user' ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
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
                    <button onClick={() => setChatInput('analyze my code')} className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">Analyze Code</button>
                    <button onClick={() => setChatInput('give me a tip')} className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">Get Tip</button>
                    <button onClick={() => setChatInput('help with error')} className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">Debug Help</button>
                </div>
            </div>
        </div>
    );
}

export default ChatAssistant;