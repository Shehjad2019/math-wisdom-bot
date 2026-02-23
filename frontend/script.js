document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const currentModeTitle = document.getElementById('current-mode-title');
    const currentModeDesc = document.getElementById('current-mode-desc');
    const modelSelector = document.getElementById('model-selector');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');

    let currentMode = "Smart Auto";
    let conversationMemory = [];
    const API_URL = "http://localhost:8005/solve";

    // Configure marked wrapper for Highlight.js
    marked.setOptions({
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-'
    });

    // --- Dynamic Settings UI ---
    // API keys are now securely managed on the backend

    // --- Mode Selection ---
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            if (currentMode === "Smart Auto") {
                currentModeTitle.textContent = "Smart Math Assistant";
                currentModeDesc.textContent = "Powered by Auto-Routing";
            } else if (currentMode === "Math Solver") {
                currentModeTitle.textContent = "Math Problem Solver";
                currentModeDesc.textContent = "Powered by LangChain";
            } else {
                currentModeTitle.textContent = "Wikipedia Search Assistant";
                currentModeDesc.textContent = "Fact checking & knowledge";
            }
        });
    });

    // --- Theme Toggling ---
    themeToggleBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const isDark = root.getAttribute('data-theme') === 'dark';

        if (isDark) {
            root.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
        } else {
            root.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
        }
    });

    // --- Clear Chat ---
    clearChatBtn.addEventListener('click', () => {
        conversationMemory = [];
        // Keep only the first welcome message
        const welcomeMessage = chatHistory.firstElementChild;
        chatHistory.innerHTML = '';
        if (welcomeMessage) chatHistory.appendChild(welcomeMessage);
    });

    // --- Auto-resize textarea ---
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        sendBtn.disabled = this.value.trim() === '';
    });

    // --- Keyboard Shortcuts ---
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) handleSend();
        }
    });

    // --- Chat Rendering ---
    function createMessageBubble(isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

        const messageOuter = document.createElement('div');
        messageOuter.classList.add('message-outer');

        const copyBtn = document.createElement('button');
        copyBtn.classList.add('copy-msg-btn');
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(copyBtn.dataset.rawText || "");
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 2000);
        };

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');

        messageOuter.appendChild(contentDiv);
        if (!isUser) messageOuter.appendChild(copyBtn);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(messageOuter);
        chatHistory.appendChild(messageDiv);

        return { contentDiv, copyBtn };
    }

    function renderMathAndMarkdown(element, rawText) {
        // Parse markdown
        let html = marked.parse(rawText);
        element.innerHTML = html;

        // Parse KaTeX math
        renderMathInElement(element, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
        });
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const loadingHtml = `
            <div id="${id}" class="message bot-message">
                <div class="avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        chatHistory.insertAdjacentHTML('beforeend', loadingHtml);
        scrollToBottom();
        return id;
    }

    function scrollToBottom() {
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    }

    // --- Sending and Streaming Logic ---
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Add User message
        const { contentDiv: userContent } = createMessageBubble(true);
        userContent.textContent = text;
        conversationMemory.push({ role: "user", content: text });

        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        sendBtn.disabled = true;

        // 2. Add loading state
        const loadingId = addLoadingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: text,
                    mode: currentMode,
                    model: modelSelector.value,
                    history: conversationMemory.slice(0, -1) // Exclude current question from history
                })
            });

            // 3. Remove loading, prepare bot bubble
            document.getElementById(loadingId)?.remove();

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const { contentDiv } = createMessageBubble(false);
                contentDiv.innerHTML = `<strong>Error:</strong> ${data.detail || 'An unknown error occurred.'}`;
                return;
            }

            const { contentDiv: botContent, copyBtn } = createMessageBubble(false);

            // 4. Stream response
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullBotText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode chunk and append
                fullBotText += decoder.decode(value, { stream: true });
                copyBtn.dataset.rawText = fullBotText;

                // Partially render markdown as it streams
                renderMathAndMarkdown(botContent, fullBotText);
                scrollToBottom();
            }

            // Save to memory
            conversationMemory.push({ role: "assistant", content: fullBotText });

        } catch (error) {
            document.getElementById(loadingId)?.remove();
            const { contentDiv } = createMessageBubble(false);
            contentDiv.innerHTML = `<strong>Network Error:</strong> Could not connect to backend server.`;
            console.error("Fetch error:", error);
        }
    }

    sendBtn.addEventListener('click', handleSend);
    sendBtn.disabled = true;
});
