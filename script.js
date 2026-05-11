document.addEventListener('DOMContentLoaded', () => {
    // View Switching
    const navBtns = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            navBtns.forEach(b => b.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // File Upload Logic for View 1
    const fileSysInput = document.getElementById('file-sys');
    const dropSys = document.getElementById('drop-sys');
    const fileOrigInput = document.getElementById('file-orig');
    const dropOrig = document.getElementById('drop-orig');
    const btnProcess = document.getElementById('btn-process-qa');

    let sysFile = null;
    let origFile = null;
    let docxPdfFile = null;

    function checkFiles() {
        if (sysFile && origFile) {
            btnProcess.disabled = false;
        } else {
            btnProcess.disabled = true;
        }
    }

    function setupDragAndDrop(dropArea, fileInput, type) {
        // Click to upload
        dropArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0], dropArea, type);
            }
        });

        // Drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('dragover');
            }, false);
        });

        dropArea.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
            if (files.length > 0) {
                handleFile(files[0], dropArea, type);
            }
        }, false);
    }

    function handleFile(file, dropArea, type) {
        if (file.type !== 'application/pdf') {
            alert('Chỉ chấp nhận file PDF!');
            return;
        }

        if (type === 'sys') {
            sysFile = file;
        } else if (type === 'orig') {
            origFile = file;
        } else if (type === 'docx') {
            docxPdfFile = file;
            dropArea.classList.add('has-file');
            const textElem = dropArea.querySelector('.upload-text');
            textElem.textContent = file.name;
            return;
        }

        dropArea.classList.add('has-file');
        const textElem = dropArea.querySelector('.upload-text');
        textElem.textContent = file.name;

        checkFiles();
    }

    setupDragAndDrop(dropSys, fileSysInput, 'sys');
    setupDragAndDrop(dropOrig, fileOrigInput, 'orig');

    // Process button click
    btnProcess.addEventListener('click', () => {
        if (!sysFile || !origFile) return;

        btnProcess.innerHTML = 'Đang xử lý... <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>';
        btnProcess.disabled = true;

        // Add simple spin animation to head for the button
        if (!document.getElementById('spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 2s linear infinite; }`;
            document.head.appendChild(style);
        }

        // Simulate API call
        setTimeout(() => {
            alert('Xử lý thành công!');
            btnProcess.innerHTML = 'Bắt đầu quy trình kiểm tra <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
            btnProcess.disabled = false;
        }, 2000);
    });

    // --- Logic for Convert Docx using Gemini API ---
    const btnConvertDocx = document.getElementById('btn-convert-docx');
    const apiKeyInput = document.getElementById('gemini-api-key');
    const systemPromptInput = document.getElementById('system-prompt');
    const dropDocxPdf = document.getElementById('drop-docx-pdf');
    const fileDocxPdfInput = document.getElementById('file-docx-pdf');
    const aiResponseBox = document.getElementById('ai-response-box');

    // Load saved settings from localStorage
    if (localStorage.getItem('gemini_api_key')) {
        apiKeyInput.value = localStorage.getItem('gemini_api_key');
    }
    if (localStorage.getItem('gemini_system_prompt')) {
        systemPromptInput.value = localStorage.getItem('gemini_system_prompt');
    }

    // Save settings to localStorage on input
    apiKeyInput.addEventListener('input', (e) => localStorage.setItem('gemini_api_key', e.target.value));
    systemPromptInput.addEventListener('input', (e) => localStorage.setItem('gemini_system_prompt', e.target.value));

    setupDragAndDrop(dropDocxPdf, fileDocxPdfInput, 'docx');

    setupDragAndDrop(dropDocxPdf, fileDocxPdfInput, 'docx');

    btnConvertDocx.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const systemPrompt = systemPromptInput.value.trim();

        if (!apiKey) {
            alert('Vui lòng nhập Gemini API Key!');
            apiKeyInput.focus();
            return;
        }

        if (!docxPdfFile) {
            alert('Vui lòng tải lên file PDF đề thi!');
            return;
        }

        // Set loading state
        btnConvertDocx.disabled = true;
        btnConvertDocx.innerHTML = 'Đang xử lý... <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>';

        // Clear previous output
        aiResponseBox.innerHTML = '';
        aiResponseBox.style.color = '#1e293b'; // Reset color

        try {
            const formData = new FormData();
            formData.append('file', docxPdfFile);
            formData.append('geminiApiKey', apiKey);
            if (systemPrompt) {
                formData.append('systemPrompt', systemPrompt);
            }

            const response = await fetch('https://sonnh-onluyen-pj.onrender.com/api/convert-docx', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Có lỗi xảy ra khi gọi API');
            }

            // Handle streaming response using Server-Sent Events (SSE)
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let fullResponse = "";
            let buffer = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split(/\r?\n/);
                    
                    buffer = lines.pop(); // Keep the last incomplete line in the buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.substring(6).trim();
                            if (dataStr === '[DONE]') continue;
                            
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.error) {
                                    throw new Error(data.error.message);
                                }
                                if (data.candidates && data.candidates.length > 0) {
                                    const candidate = data.candidates[0];
                                    const parts = candidate.content?.parts;
                                    if (parts && parts.length > 0) {
                                        const textPart = parts[0].text;
                                        if (textPart) {
                                            fullResponse += textPart;
                                        }
                                    }
                                    // Check if stopped early
                                    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
                                        fullResponse += `\n[Hệ thống ngừng tạo do: ${candidate.finishReason}]`;
                                    }
                                }
                            } catch (e) {
                                console.error("Error parsing SSE JSON:", e, dataStr);
                            }
                        }
                    }
                    
                    // Update UI progressively
                    aiResponseBox.textContent = fullResponse;
                    // Scroll to bottom
                    aiResponseBox.scrollTop = aiResponseBox.scrollHeight;
                }
            }

        } catch (error) {
            aiResponseBox.style.color = '#dc2626'; // Error color red
            aiResponseBox.textContent = `Lỗi: ${error.message}`;
        } finally {
            // Restore button state
            btnConvertDocx.disabled = false;
            btnConvertDocx.innerHTML = 'Bắt đầu Convert <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        }
    });
});
