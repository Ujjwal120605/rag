# 🧠 Document Analyzer — AI-Powered Document Understanding with Gemini

![Streamlit](https://img.shields.io/badge/Framework-Streamlit-FF4B4B?style=flat-square&logo=streamlit)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)
![Google Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> 📄 An interactive **AI Document Analyzer** built with **Streamlit** and **Google Gemini**, allowing you to chat with your PDFs, extract insights, and summarize complex documents in seconds.

---

## 🚀 Features

✅ **Chat with Your Document**
- Upload any PDF and start a natural conversation about its contents.

✅ **Smart Summarization**
- Get concise summaries and section-level insights powered by **Gemini AI**.

✅ **Question Answering**
- Ask context-aware questions and get accurate, referenced answers.

✅ **Multi-Document Support**
- Compare or analyze multiple PDFs at once.

✅ **Clean Streamlit Interface**
- Responsive, modern UI with real-time responses.

✅ **Local or Cloud Deployment**
- Works seamlessly both locally and on **Streamlit Cloud**.

---

## 🧩 Tech Stack

| Component | Technology Used |
|------------|----------------|
| **Frontend/UI** | Streamlit |
| **Backend LLM** | Google Gemini API |
| **Environment Handling** | python-dotenv |
| **Text Extraction** | PyPDF2 / pdfminer / langchain.text_splitter |
| **Vector Storage (optional)** | ChromaDB or FAISS |
| **Language** | Python 3.10+ |

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Ujjwal120605/rag.git
cd rag
2️⃣ Create a virtual environment
bash
Copy code
python3 -m venv venv
source venv/bin/activate   # for macOS/Linux
venv\Scripts\activate      # for Windows
3️⃣ Install dependencies
bash
Copy code
pip install -r requirements.txt
4️⃣ Add your Gemini API key
Create a .env file in the project root:

ini
Copy code
GOOGLE_API_KEY=your_google_gemini_api_key
You can get your key from Google AI Studio.

5️⃣ Run the app
bash
Copy code
streamlit run app.py
Then open your browser at 👉 http://localhost:8501

🧠 How It Works
Upload a PDF
The app extracts text content from your document.

Chunk & Embed (optional)
Text is split into chunks and (optionally) stored in vector DBs for efficient retrieval.

Ask Questions or Summarize
The Gemini model uses context to answer queries or summarize intelligently.

Interactive Responses
Streamlit displays real-time answers in a chat-like interface.

🖼️ Sample Screenshot
Add a screenshot after deployment:

markdown
Copy code
![Document Analyzer Demo](./screenshot.png)
☁️ Deployment on Streamlit Cloud
Push your project to GitHub.

Go to Streamlit Cloud.

Connect your GitHub repo.

Set your environment variable:

GOOGLE_API_KEY = your_api_key

Deploy and enjoy 🚀

🧾 Example Use Cases
Research paper summarization

Legal document understanding

Resume screening

Policy and report comparison

Knowledge extraction from manuals or handbooks

🧰 Requirements
nginx
Copy code
streamlit
google-generativeai
python-dotenv
PyPDF2
langchain
chromadb
tiktoken
(You can remove chromadb if not using retrieval-based methods.)

🤝 Contributing
Pull requests are welcome!
If you find a bug or want to add features, open an issue first to discuss your ideas.

🪪 License
This project is licensed under the MIT License — feel free to use and modify it.

👤 Author
Ujjwal Bajpai
📍 RV College of Engineering, Bangalore
💼 GitHub: @Ujjwal120605

“Turning static PDFs into intelligent, conversational knowledge.”

yaml
Copy code

---

Would you like me to:
- 🔹 include **a “System Architecture” diagram** (with blocks like “PDF Input → Text Splitter → Gemini Model → Streamlit UI”)?  
- 🔹 or a **short demo GIF placeholder** section for when you deploy on Streamlit Cloud?

I can add either (or both) to make your README top-tier.
