# 🧠 Math Wisdom Bot

![Math Wisdom Bot](https://img.shields.io/badge/Status-Active-success.svg)
![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-00A6D6.svg?logo=fastapi)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E.svg?logo=javascript)

Math Wisdom Bot is a modern, premium full-stack application designed to solve complex mathematical problems and answer factual queries. By combining the speed of the **Groq Llama 3** engine, the robust reasoning of **Gemini 1.5 Pro**, **Claude 3 Haiku**, and **OpenAI GPT-4o Mini** with a smart intent router, this bot dynamically switches contexts to provide the best possible answer—whether that involves executing code, parsing Wikipedia, or streaming LaTeX-formatted mathematics.

---

## ✨ Key Features

*   **⚡ Streaming AI Responses:** Built natively with Web Streams API and FastAPI `StreamingResponse` for a ChatGPT-like, real-time typing effect.
*   **🧠 Conversation Memory:** Maintains rolling context allowing for follow-up questions and conversational problem solving.
*   **🔀 Smart Auto-Routing:** Intelligently classifies user intent and seamlessly routes queries between an LLM Math Solver and a Wikipedia Fact Searcher.
*   **📐 KaTeX & Markdown Rendering:** Mathematical equations (`$inline$` and `$$block$$`), code blocks, and markdown are beautifully rendered client-side.
*   **🔌 Multi-Model Support:** Instantly switch between cutting-edge LLMs (Groq, Gemini, Claude, OpenAI) securely from the backend without exposing API keys.
*   **💅 Premium UI/UX:** Responsive design featuring Dark/Light mode toggles, one-click "Copy Response" tooltips, auto-resizing text areas, and bouncy "Thinking..." animations.

---

## 🛠️ Technology Stack

**Backend**
*   **Framework:** FastAPI (Uvicorn)
*   **AI/LLM:** LangChain ecosystems (`langchain-core`, `langchain-groq`, `langchain-google-genai`, `langchain-anthropic`, `langchain-openai`)
*   **Routing/Services:** Python `wikipedia` package, Python `dotenv`

**Frontend**
*   **Structure/Styling:** Native HTML5, CSS3 (CSS Variables for Theming)
*   **Logic:** Vanilla JavaScript (ES6+ Fetch API, ReadableStreams)
*   **Rendering:** KaTeX (Math), marked.js (Markdown), Highlight.js (Code Blocks)

---

## 📁 Project Structure

```text
math-wisdom-bot/
├── .env.example                # Example environment variables file
├── README.md                   # Project documentation
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python backend dependencies
│   ├── routes/
│   │   └── chat.py             # FastAPI router handling /solve endpoint
│   └── services/
│       ├── llm_service.py      # LangChain integration, prompt engineering, streaming
│       └── wiki_service.py     # Wikipedia API scraping logic
└── frontend/
    ├── index.html              # Main UI structure and CDN imports
    ├── script.js               # Chat state, streaming parser, and UI interactions
    └── styles.css              # Custom CSS with Light/Dark themes and animations
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites
*   Python 3.9 or higher
*   At least one valid API Key from Groq, Google (Gemini), Anthropic (Claude), or OpenAI.

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/math-wisdom-bot.git
cd math-wisdom-bot
```

### 3. Backend Setup
Create a virtual environment to isolate the project's dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

Install the required Python packages:
```bash
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables
Copy the example environment file and add your secret API keys:

```bash
cp .env.example .env
```
Open the `.env` file and securely paste in your required keys:
```env
GROQ_API_KEY="your_groq_key_here"
GEMINI_API_KEY="your_gemini_key_here"
ANTHROPIC_API_KEY="your_anthropic_key_here"
OPENAI_API_KEY="your_openai_key_here"
```

### 5. Run the Application
Start the FastAPI backend server using Uvicorn:

```bash
cd backend
uvicorn main:app --reload --port 8005
```

The server will begin running on `http://localhost:8005`.

To launch the frontend, simply open `frontend/index.html` in your favorite web browser!

---

## 💡 Usage Guide

1.  **Launch the App**: Open the `index.html` file. You will be greeted by the Math Wisdom Bot interface.
2.  **Select a Mode**: Choose between *Smart Auto* (recommended), *Math Solver*, or *Wiki Search* via the left sidebar.
3.  **Choose an Engine**: Use the dropdown to select which AI brain you want to power the bot (e.g., Llama 3, GPT-4o Mini).
4.  **Query**: Type your prompt. Use `Shift+Enter` for a new line and `Enter` to send.
    *   *Example Math Prompt*: "Solve for x: $2x^2 + 5x - 3 = 0$ using the quadratic formula."
    *   *Example Wiki Prompt*: "Who was Ada Lovelace?"

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.