import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, MessageSquare, BarChart3, Settings, Send, Download, RefreshCw, Trash2, Eye, EyeOff, Check, AlertCircle, Loader2, X, Menu, Moon, Bug } from 'lucide-react';

const DocumentAnalyzer = () => {
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-exp');
  const [temperature, setTemperature] = useState(0.3);
  const [activeMode, setActiveMode] = useState('chat');
  const [analysisType, setAnalysisType] = useState('summary');
  const [customPrompt, setCustomPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLength, setPreviewLength] = useState(1000);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (apiKey && apiKey.length > 10) {
      setApiKeySaved(true);
    }
  }, [apiKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveApiKey = () => {
    if (apiKey) {
      setApiKeySaved(true);
      showSuccess('API Key saved for this session!');
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setApiKeySaved(false);
    showSuccess('API Key cleared');
  };

  const extractTextFromTXT = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          console.log('✅ TXT extraction successful - Length:', text.length);
          resolve({ text, success: true });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Use pdf.js library loaded from CDN
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          
          if (!pdfjsLib) {
            // Fallback to basic extraction if pdf.js not loaded
            console.warn('⚠️ PDF.js not loaded, using fallback method');
            const uint8Array = new Uint8Array(arrayBuffer);
            let pdfText = '';
            for (let i = 0; i < uint8Array.length; i++) {
              pdfText += String.fromCharCode(uint8Array[i]);
            }
            
            let extractedText = '';
            const textPattern = /\(([^)]{2,})\)/g;
            let match;
            while ((match = textPattern.exec(pdfText)) !== null) {
              let text = match[1];
              if (/[a-zA-Z0-9]/.test(text)) {
                text = text.replace(/\\n/g, ' ')
                           .replace(/\\r/g, '')
                           .replace(/\\t/g, ' ')
                           .replace(/\\\(/g, '(')
                           .replace(/\\\)/g, ')')
                           .replace(/\\\\/g, '\\');
                extractedText += text + ' ';
              }
            }
            
            extractedText = extractedText.replace(/\s+/g, ' ').trim();
            
            if (extractedText.length < 50) {
              reject(new Error('Could not extract text from PDF. Try using a TXT file or enable PDF.js library.'));
            } else {
              resolve({ text: extractedText, success: true });
            }
            return;
          }
          
          // Use PDF.js for proper extraction
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          fullText = fullText.replace(/\s+/g, ' ').trim();
          
          console.log('✅ PDF.js extraction - Length:', fullText.length);
          console.log('📄 First 500 chars:', fullText.substring(0, 500));
          
          if (fullText.length < 50) {
            reject(new Error('Could not extract sufficient text from PDF. The PDF may be image-based.'));
          } else {
            resolve({ text: fullText, success: true });
          }
        } catch (err) {
          console.error('PDF extraction error:', err);
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    const isPDF = fileName.endsWith('.pdf');
    const isTXT = fileName.endsWith('.txt');
    
    if (!isPDF && !isTXT) {
      showError('Please upload a PDF or TXT file only.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      showError('File size must be less than 10MB');
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingProgress(0);
    setExtractedText('');
    setAnalysisResult('');
    setChatMessages([]);
    
    try {
      setProcessingProgress(20);
      
      let result;
      if (isTXT) {
        result = await extractTextFromTXT(file);
      } else if (isPDF) {
        result = await extractTextFromPDF(file);
      }
      
      setProcessingProgress(70);
      
      if (result && result.text && result.text.trim().length > 0) {
        const cleanedText = result.text.trim();
        setExtractedText(cleanedText);
        setProcessingProgress(100);
        showSuccess(`✅ Successfully extracted ${cleanedText.length} characters from '${file.name}'!`);
        console.log('📊 Extraction complete - Ready for analysis');
      } else {
        showError('No text could be extracted from the document');
      }
    } catch (err) {
      console.error('❌ Extraction error:', err);
      showError('Error processing file: ' + err.message);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  };

  const callGeminiAPI = async (prompt) => {
    if (!apiKey) throw new Error('API key is required');
    
    console.log('🚀 Calling Gemini API...');
    console.log('📝 Prompt length:', prompt.length);
    console.log('🔧 Using model:', selectedModel);
    console.log('🌐 API endpoint: v1beta/models/' + selectedModel);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: temperature, 
          topP: 0.95, 
          topK: 40, 
          maxOutputTokens: 8192 
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text;
    console.log('✅ API response received - Length:', result.length);
    return result;
  };

  const runAnalysis = async () => {
    if (!apiKey) {
      showError('Please enter your API key first!');
      return;
    }
    if (!extractedText || extractedText.trim().length < 10) {
      showError('Please upload and process a document first!');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    const prompts = {
      summary: `You are a document analyst. Read the ENTIRE TEXT carefully and provide a comprehensive summary.

CRITICAL RULES:
- Focus ONLY on the actual TEXT CONTENT of the document
- IGNORE any PDF metadata, compression info, or file structure details
- Extract and summarize the READABLE TEXT only
- Include specific details, facts, and information from the actual content

Provide:
1. Main topics and themes from the text
2. Key points and arguments
3. Important details and facts mentioned
4. Main conclusions`,

      keypoints: `Extract the key points from the ACTUAL TEXT CONTENT of this document.

CRITICAL RULES:
- Read ONLY the readable text, NOT PDF structure/metadata
- Extract 8-12 important points from what the text actually says
- Include specific facts, names, numbers from the content
- Format as clear bullet points`,

      sentiment: `Analyze the sentiment and tone of the ACTUAL TEXT in this document.

Focus on the written content and language used, not file metadata.`,

      qa: `Generate 10 questions and answers based on the ACTUAL TEXT CONTENT.

CRITICAL: Base questions on what the document actually says, not on PDF structure.`,

      entities: `Extract named entities from the ACTUAL TEXT CONTENT:
- People and their roles
- Organizations mentioned
- Locations referenced
- Dates and times
- Important numbers and statistics

ONLY extract from readable text, ignore PDF metadata.`,

      classification: `Classify this document based on its ACTUAL TEXT CONTENT:
- Type and purpose
- Subject matter
- Target audience
- Writing style

Focus on the content, not file format.`,

      topics: `Identify 5-7 main topics from the ACTUAL TEXT CONTENT with examples and explanations.`,

      custom: customPrompt || 'Analyze the actual text content of this document.'
    };
    
    try {
      const promptText = prompts[analysisType];
      const docText = extractedText.substring(0, 40000);
      
      const fullPrompt = `${promptText}

======== DOCUMENT TEXT CONTENT START ========
${docText}
======== DOCUMENT TEXT CONTENT END ========

IMPORTANT: Analyze the TEXT CONTENT above. Focus on what the text actually says, NOT on PDF structure, image data, or file metadata.

Your analysis:`;
      
      console.log('📊 Running analysis:', analysisType);
      console.log('📄 Analyzing', docText.length, 'characters');
      
      const result = await callGeminiAPI(fullPrompt);
      setAnalysisResult(result);
      showSuccess('✅ Analysis complete!');
    } catch (err) {
      console.error('❌ Analysis error:', err);
      showError('Analysis failed: ' + err.message);
      setAnalysisResult('❌ Error: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !apiKey || !extractedText) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentQuestion = chatInput;
    setChatInput('');
    setIsChatting(true);
    
    try {
      const docText = extractedText.substring(0, 40000);
      
      const context = `You are a helpful document Q&A assistant. Answer questions based ONLY on the ACTUAL TEXT CONTENT of the document.

CRITICAL RULES:
- Focus on the readable text content, NOT PDF metadata or file structure
- Answer using information from what the text actually says
- If the answer is not in the text content, say: "I cannot find this information in the document text."
- Be accurate and reference specific parts of the text

======== DOCUMENT TEXT CONTENT START ========
${docText}
======== DOCUMENT TEXT CONTENT END ========

USER QUESTION: ${currentQuestion}

Answer based on the text content above:`;

      console.log('💬 Processing chat question:', currentQuestion);
      
      const response = await callGeminiAPI(context);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('❌ Chat error:', err);
      showError('Chat failed: ' + err.message);
      setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Error: ' + err.message }]);
    } finally {
      setIsChatting(false);
    }
  };

  const runAdvancedAnalytics = async () => {
    if (!apiKey || !extractedText) {
      showError('API key and document required!');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    const analyses = [
      { 
        name: 'Executive Summary', 
        prompt: `Provide a comprehensive 3-4 paragraph summary of the ACTUAL TEXT CONTENT. Focus on what the text says, not file metadata.` 
      },
      { 
        name: 'Key Insights', 
        prompt: `Extract 7-10 key insights from the TEXT CONTENT with specific details and examples from what is written.` 
      },
      { 
        name: 'Named Entities', 
        prompt: `Extract all named entities (people, organizations, locations, dates) from the ACTUAL TEXT. Ignore PDF metadata.` 
      },
      { 
        name: 'Main Themes', 
        prompt: `Identify the main themes and topics discussed in the TEXT CONTENT.` 
      },
      { 
        name: 'Key Takeaways', 
        prompt: `List the most important takeaways and conclusions from the TEXT CONTENT.` 
      }
    ];
    
    try {
      let results = `# 📊 Advanced Analytics Report\n\n**Document:** ${uploadedFile?.name}\n**Generated:** ${new Date().toLocaleString()}\n**Model:** ${selectedModel}\n**Text Size:** ${extractedText.length} characters\n\n---\n\n`;
      
      for (let i = 0; i < analyses.length; i++) {
        const analysis = analyses[i];
        setAnalysisResult(results + `\n⏳ Processing: ${analysis.name}...`);
        
        const docText = extractedText.substring(0, 35000);
        const prompt = `${analysis.prompt}

======== DOCUMENT TEXT CONTENT START ========
${docText}
======== DOCUMENT TEXT CONTENT END ========

IMPORTANT: Analyze the TEXT CONTENT, not PDF structure or metadata.

Your analysis:`;

        console.log(`📊 Running analysis ${i + 1}/${analyses.length}:`, analysis.name);
        const result = await callGeminiAPI(prompt);
        results += `## ${i + 1}. ${analysis.name}\n\n${result}\n\n---\n\n`;
        setAnalysisResult(results);
      }
      
      showSuccess('✅ Advanced analytics complete!');
    } catch (err) {
      console.error('❌ Advanced analytics error:', err);
      showError('Advanced analytics failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnalysis = () => {
    const blob = new Blob([analysisResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadChat = () => {
    const chatText = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div style={{ background: '#1a1625', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', borderBottom: '1px solid #2d2640' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Moon size={32} color="#a78bfa" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>🤖 Advanced Document Analyzer</h1>
            <p style={{ color: '#9ca3af', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Upload PDF or TXT files and analyze with Google's Gemini AI</p>
          </div>
          <button onClick={() => setShowDebugInfo(!showDebugInfo)} style={{ padding: '0.5rem', background: showDebugInfo ? 'rgba(167, 139, 250, 0.3)' : 'transparent', border: '1px solid #3d3650', borderRadius: '0.5rem', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center' }} title="Toggle debug info"><Bug size={20} /></button>
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ padding: '0.75rem', background: '#2d2640', border: '1px solid #3d3650', borderRadius: '0.5rem', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center' }}><Menu size={20} /></button>
        </div>
      </div>

      {showDebugInfo && extractedText && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.75rem', padding: '1rem', color: '#86efac', fontSize: '0.875rem', fontFamily: 'monospace' }}>
            <strong>🐛 Debug Info:</strong><br/>
            Model: {selectedModel}<br/>
            API Endpoint: v1/models/{selectedModel}:generateContent<br/>
            Extracted Text Length: {extractedText.length} chars<br/>
            Words: {extractedText.split(/\s+/).filter(w => w.length > 0).length}<br/>
            First 300 chars: {extractedText.substring(0, 300)}...<br/>
            Last 200 chars: ...{extractedText.substring(extractedText.length - 200)}
          </div>
        </div>
      )}

      {error && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem 0 1.5rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(10px)' }}>
            <AlertCircle color="#ef4444" size={20} />
            <span style={{ color: '#fca5a5', flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#ef4444" /></button>
          </div>
        </div>
      )}
      
      {success && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem 0 1.5rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(10px)' }}>
            <Check color="#22c55e" size={20} />
            <span style={{ color: '#86efac' }}>{success}</span>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: showSidebar ? '320px 1fr' : '1fr', gap: '1.5rem' }}>
        {showSidebar && (
          <div style={{ background: 'rgba(26, 22, 37, 0.7)', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.1)', backdropFilter: 'blur(10px)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb' }}><Settings size={20} color="#a78bfa" />Configuration</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>Google AI API Key</label>
                {apiKeySaved ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#86efac', marginBottom: '0.5rem' }}><Check size={16} /><span>API Key Loaded</span></div>
                    <button onClick={clearApiKey} style={{ fontSize: '0.875rem', color: '#fca5a5', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Clear Key</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem', border: '1px solid #3d3650', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#1a1625', color: '#e5e7eb' }} />
                      <button onClick={() => setShowApiKey(!showApiKey)} style={{ position: 'absolute', right: '0.5rem', top: '0.625rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>{showApiKey ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}</button>
                    </div>
                    {apiKey && <button onClick={saveApiKey} style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '0.5rem', fontWeight: '500' }}>Save API Key</button>}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none' }}>Get API Key →</a>
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem', lineHeight: '1.4' }}>💡 Tip: Create a .env file with REACT_APP_GEMINI_API_KEY=your_key</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>Application Mode</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { id: 'chat', icon: MessageSquare, label: 'Chat with Document' },
                  { id: 'analyze', icon: FileText, label: 'Analyze Document' },
                  { id: 'advanced', icon: BarChart3, label: 'Advanced Analytics' }
                ].map(mode => {
                  const Icon = mode.icon;
                  return <button key={mode.id} onClick={() => setActiveMode(mode.id)} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s', background: activeMode === mode.id ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 'rgba(45, 38, 64, 0.6)', color: activeMode === mode.id ? 'white' : '#d1d5db', border: activeMode === mode.id ? 'none' : '1px solid rgba(167, 139, 250, 0.2)', cursor: 'pointer' }}><Icon size={16} />{mode.label}</button>;
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>Model</label>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #3d3650', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#1a1625', color: '#e5e7eb' }}>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                <option value="gemini-exp-1206">Gemini Exp 1206</option>
              </select>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>⚠️ Gemini 1.5 models retired - using 2.0</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>Temperature: {temperature}</label>
              <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}><span>Precise</span><span>Creative</span></div>
            </div>

            {activeMode === 'analyze' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>Analysis Type</label>
                <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #3d3650', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#1a1625', color: '#e5e7eb', marginBottom: '0.5rem' }}>
                  <option value="summary">📝 Comprehensive Summary</option>
                  <option value="keypoints">🎯 Key Points Extraction</option>
                  <option value="sentiment">😊 Sentiment Analysis</option>
                  <option value="qa">❓ Q&A Generation</option>
                  <option value="entities">🏷️ Entity Recognition</option>
                  <option value="classification">📑 Document Classification</option>
                  <option value="topics">🔗 Topic Modeling</option>
                  <option value="custom">✍️ Custom Prompt</option>
                </select>
                {analysisType === 'custom' && <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Enter your custom analysis prompt..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #3d3650', borderRadius: '0.5rem', fontSize: '0.875rem', minHeight: '100px', background: '#1a1625', color: '#e5e7eb', resize: 'vertical' }} />}
              </div>
            )}

            {extractedText && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid #3d3650' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', marginBottom: '0.5rem' }}>📊 Document Stats</h4>
                <div style={{ fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span style={{ color: '#9ca3af' }}>Characters:</span><span style={{ fontWeight: '500', color: '#a78bfa' }}>{extractedText.length.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span style={{ color: '#9ca3af' }}>Words:</span><span style={{ fontWeight: '500', color: '#a78bfa' }}>{extractedText.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>Lines:</span><span style={{ fontWeight: '500', color: '#a78bfa' }}>{extractedText.split('\n').length.toLocaleString()}</span></div>
                </div>
              </div>
            )}

            <div style={{ paddingTop: '1rem', borderTop: '1px solid #3d3650', fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
              <p style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>✅ Supported Files:</p>
              <p style={{ margin: '0.25rem 0', color: '#86efac' }}>• PDF (.pdf) - Text extraction</p>
              <p style={{ margin: '0.25rem 0', color: '#86efac' }}>• Text (.txt) - Full support</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', lineHeight: '1.4' }}>💡 Using PDF.js for better text extraction</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(26, 22, 37, 0.7)', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.1)', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb' }}><Upload size={24} color="#a78bfa" />Document Upload</h2>
            <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed rgba(167, 139, 250, 0.3)', borderRadius: '0.75rem', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(15, 12, 41, 0.5)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)'; e.currentTarget.style.background = 'rgba(15, 12, 41, 0.5)'; }}>
              <Upload size={48} style={{ margin: '0 auto 0.75rem auto', color: '#a78bfa' }} />
              <p style={{ color: '#d1d5db', marginBottom: '0.5rem', fontWeight: '500' }}>{uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>PDF or TXT files (Max 10MB)</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            {uploadedFile && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(45, 38, 64, 0.6)', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                  <div>
                    <p style={{ fontWeight: '500', margin: 0, color: '#e5e7eb' }}>{uploadedFile.name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {extractedText && <span style={{ padding: '0.375rem 0.875rem', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', border: '1px solid rgba(34, 197, 94, 0.3)' }}>✓ Processed</span>}
                </div>
                {isProcessing && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}><span style={{ color: '#9ca3af' }}>Processing document...</span><span style={{ fontWeight: '500', color: '#a78bfa' }}>{processingProgress}%</span></div>
                    <div style={{ width: '100%', background: 'rgba(45, 38, 64, 0.6)', borderRadius: '9999px', height: '0.5rem' }}><div style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', height: '0.5rem', borderRadius: '9999px', transition: 'width 0.3s', width: `${processingProgress}%` }} /></div>
                  </div>
                )}
                {extractedText && !isProcessing && <button onClick={() => setShowPreview(!showPreview)} style={{ width: '100%', padding: '0.625rem 1rem', background: 'rgba(45, 38, 64, 0.6)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#e5e7eb', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(45, 38, 64, 0.6)'}>{showPreview ? <EyeOff size={16} /> : <Eye size={16} />}{showPreview ? 'Hide' : 'View'} Preview</button>}
                {showPreview && extractedText && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}><label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Preview: {previewLength} chars</label><input type="range" min="500" max="5000" step="500" value={previewLength} onChange={(e) => setPreviewLength(parseInt(e.target.value))} style={{ width: '8rem', accentColor: '#a78bfa' }} /></div>
                    <textarea value={extractedText.substring(0, previewLength) + (extractedText.length > previewLength ? '\n\n... [truncated]' : '')} readOnly style={{ width: '100%', height: '16rem', padding: '0.75rem', border: '1px solid #3d3650', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace', background: '#1a1625', color: '#e5e7eb', resize: 'vertical' }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {!extractedText ? (
            <div style={{ background: 'rgba(26, 22, 37, 0.7)', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '3rem', textAlign: 'center', border: '1px solid rgba(167, 139, 250, 0.1)', backdropFilter: 'blur(10px)' }}>
              <FileText size={64} style={{ margin: '0 auto 1rem auto', color: '#4b5563' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.5rem' }}>No Document Loaded</h3>
              <p style={{ color: '#9ca3af' }}>Upload a PDF or TXT document to get started</p>
            </div>
          ) : (
            <>
              {activeMode === 'chat' && (
                <div style={{ background: 'rgba(26, 22, 37, 0.7)', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#e5e7eb' }}>Document Chat</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {chatMessages.length > 0 && (
                        <>
                          <button onClick={downloadChat} style={{ padding: '0.5rem 0.875rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: '500', transition: 'all 0.3s' }}><Download size={14} />Export</button>
                          <button onClick={() => setChatMessages([])} style={{ padding: '0.5rem 0.875rem', background: 'rgba(220, 38, 38, 0.8)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: '500', transition: 'all 0.3s' }}><Trash2 size={14} />Clear</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '0.75rem', height: '28rem', overflowY: 'auto', padding: '1rem', marginBottom: '1rem', background: 'rgba(15, 12, 41, 0.6)' }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <div style={{ textAlign: 'center' }}><MessageSquare size={48} style={{ margin: '0 auto 0.75rem auto', color: '#4b5563' }} /><p style={{ fontSize: '1rem', fontWeight: '500', color: '#d1d5db' }}>Ask anything about your document</p><p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>The AI will answer based on the actual text content</p></div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: msg.role === 'user' ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 'rgba(45, 38, 64, 0.8)', color: 'white', border: msg.role === 'user' ? 'none' : '1px solid rgba(167, 139, 250, 0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}><p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>{msg.content}</p></div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input 
                      type="text" 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="Ask a question about your document..." 
                      disabled={isChatting} 
                      style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '0.75rem', outline: 'none', background: 'rgba(15, 12, 41, 0.8)', color: '#e5e7eb', fontSize: '0.875rem' }} 
                    />
                    <button 
                      onClick={sendChatMessage} 
                      disabled={isChatting || !chatInput.trim()} 
                      style={{ padding: '0.75rem 1.5rem', background: (isChatting || !chatInput.trim()) ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: (isChatting || !chatInput.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', transition: 'all 0.3s' }}
                    >
                      {isChatting ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {activeMode === 'analyze' && (
                <div style={{ background: 'rgba(26, 22, 37, 0.7)', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#e5e7eb' }}>Analysis Results</h2>
                  <button onClick={runAnalysis} disabled={isAnalyzing} style={{ width: '100%', padding: '0.875rem 1.5rem', background: isAnalyzing ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '600', cursor: isAnalyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem', transition: 'all 0.3s' }}>{isAnalyzing ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />Analyzing...</> : <><FileText size={20} />Run Analysis</>}</button>
                  {analysisResult && (
                    <div>
                      <div style={{ padding: '1.25rem', background: 'rgba(15, 12, 41, 0.8)', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(167, 139, 250, 0.2)', maxHeight: '600px', overflowY: 'auto' }}><div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.6', color: '#e5e7eb' }}>{analysisResult}</div></div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={downloadAnalysis} style={{ flex: 1, padding: '0.625rem 1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500', transition: 'all 0.3s' }}><Download size={16} />Save Analysis</button>
                        <button onClick={() => setAnalysisResult('')} style={{ flex: 1, padding: '0.625rem 1rem', background: 'rgba(75, 85, 99, 0.6)', color: 'white', border: '1px solid rgba(107, 114, 128, 0.4)', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500', transition: 'all 0.3s' }}><RefreshCw size={16} />New Analysis</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMode === 'advanced' && (
                <div style={{ background: 'rgba(26, 22, 37, 0.7)', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#e5e7eb' }}>Advanced Analytics Dashboard</h2>
                  <button onClick={runAdvancedAnalytics} disabled={isAnalyzing} style={{ width: '100%', padding: '0.875rem 1.5rem', background: isAnalyzing ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #a78bfa, #60a5fa)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '600', cursor: isAnalyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem', transition: 'all 0.3s' }}>{isAnalyzing ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />Running Advanced Analysis...</> : <><BarChart3 size={20} />Run Advanced Analysis</>}</button>
                  {analysisResult && (
                    <div>
                      <div style={{ padding: '1.5rem', background: 'rgba(15, 12, 41, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(167, 139, 250, 0.2)', marginBottom: '1rem', maxHeight: '600px', overflowY: 'auto' }}><div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.7', color: '#e5e7eb' }}>{analysisResult}</div></div>
                      <button onClick={downloadAnalysis} style={{ width: '100%', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.95rem', transition: 'all 0.3s' }}><Download size={18} />Download Complete Report</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ background: 'rgba(26, 22, 37, 0.9)', borderTop: '1px solid rgba(167, 139, 250, 0.2)', marginTop: '3rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#e5e7eb', fontSize: '1rem' }}>🚀 Advanced Gemini Document Analyzer</p>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0', color: '#9ca3af' }}>Built with React & Google Gemini AI | <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '500' }}>Get API Key</a></p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem', lineHeight: '1.5' }}>✅ Fixed: Now using Gemini API v1 with correct model names<br/>💡 Chat mode is default for instant Q&A with your documents</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(45, 38, 64, 0.4); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.7); }
      `}</style>
    </div>
  );
};

export default DocumentAnalyzer;