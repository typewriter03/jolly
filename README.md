# Legal Statute Pipeline

An AI-powered application that classifies legal case text and maps IPC (Indian Penal Code) sections to their corresponding BNS (Bharatiya Nyaya Sanhita) equivalents using a fine-tuned Longformer model.

> [!IMPORTANT]
> **Model files not included**: The trained model (~1GB) is not included in this repository due to size constraints. See [Model Setup](#4-model-setup) for instructions.

## 🌟 Features

- **Legal Text Classification**: Analyze case descriptions and predict applicable IPC sections with confidence scores
- **IPC to BNS Mapping**: Automatic conversion from legacy IPC codes to new BNS codes (Bharatiya Nyaya Sanhita 2023)
- **Multi-label Classification**: Returns top 5 matching sections ranked by confidence
- **Search History**: Firebase-authenticated users can save and track their search history
- **Modern UI**: Responsive React frontend with TailwindCSS styling
- **REST API**: Clean FastAPI backend for easy integration

## 🏗️ Project Structure

```
legal-statute-pipeline/
├── backend/                    # FastAPI Python server
│   ├── main.py                 # API endpoints & model inference
│   ├── database.py             # SQLAlchemy models & DB setup
│   ├── preprocessing.py        # Text cleaning & NLP preprocessing
│   └── requirements.txt        # Python dependencies
├── frontend-simple/            # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── firebase.js         # Firebase auth configuration
│   │   └── index.css           # TailwindCSS styles
│   └── package.json            # Node.js dependencies
├── model_data/                 # [NOT IN REPO] Fine-tuned Longformer model
│   ├── config.json             # Model configuration
│   ├── model.safetensors       # Model weights (~534MB)
│   ├── tokenizer.json          # Tokenizer files
│   └── id2label.json           # Label ID to IPC section mapping
├── mappings/
│   └── ipc_to_bns.json         # IPC to BNS section mapping data
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 📋 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.9+ | 3.10+ recommended |
| Node.js | 18+ | For frontend |
| CUDA | 11.x+ | Optional, for GPU acceleration |
| RAM | 8GB+ | 16GB recommended for model loading |

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/typewriter03/jolly.git
cd legal-statute-pipeline
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model (required for text preprocessing)
python -m spacy download en_core_web_sm
```

### 3. Frontend Setup

```bash
cd frontend-simple

# Install dependencies
npm install
```

### 4. Model Setup

> [!CAUTION]
> The model files are **not included** in the repository due to their size (~1GB). You must obtain them separately.

Create a `model_data/` directory in the project root and add the following files:

| File | Description | Required |
|------|-------------|----------|
| `config.json` | Longformer model configuration | ✅ Yes |
| `model.safetensors` | Trained model weights (~534MB) | ✅ Yes |
| `tokenizer.json` | Tokenizer vocabulary | ✅ Yes |
| `tokenizer_config.json` | Tokenizer configuration | ✅ Yes |
| `id2label.json` | Maps model output IDs to IPC section labels | ✅ Yes |
| `vocab.txt` | Vocabulary file | ✅ Yes |
| `special_tokens_map.json` | Special tokens configuration | ✅ Yes |

**To obtain the model:**
- Contact the repository maintainer, OR
- Train your own model using the training notebook (not included)

### 5. Firebase Setup (Optional - for user authentication)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Copy your Firebase config to `frontend-simple/src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend

# Activate virtual environment first
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend API: `http://localhost:8000`  
📖 API Docs: `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
cd frontend-simple
npm run dev
```

✅ Frontend: `http://localhost:5173`

## 📡 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Classify legal text and return IPC/BNS predictions |
| `GET` | `/history/{user_id}` | Get search history for a user |
| `DELETE` | `/history/{user_id}` | Clear search history for a user |

### POST /predict

Analyzes legal case text and returns matching IPC sections with BNS equivalents.

**Request:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "theft of property from residence", "user_id": "user123"}'
```

**Response:**
```json
{
  "predictions": [
    {
      "ipc_code": "IPC 379",
      "ipc_title": "Punishment for theft",
      "ipc_desc": "Whoever commits theft shall be punished...",
      "bns_code": "BNS 303",
      "bns_title": "Punishment for theft",
      "bns_desc": "Whoever commits theft shall be punished...",
      "confidence": 0.92
    },
    {
      "ipc_code": "IPC 380",
      "ipc_title": "Theft in dwelling house",
      "ipc_desc": "Whoever commits theft in any building...",
      "bns_code": "BNS 304",
      "bns_title": "Theft in dwelling house",
      "bns_desc": "Whoever commits theft in any building...",
      "confidence": 0.78
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory (optional):

```env
MODEL_DIR=../model_data
LABEL_MAP_PATH=../model_data/id2label.json
BNS_MAP_PATH=../mappings/ipc_to_bns.json
```

## 📊 Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern async web framework |
| **PyTorch** | Deep learning inference |
| **Transformers** | Hugging Face Longformer model |
| **SQLAlchemy** | Database ORM for search history |
| **spaCy** | NLP text preprocessing |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI components |
| **Vite** | Fast build tool |
| **TailwindCSS 4** | Utility-first styling |
| **Firebase** | User authentication |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### Model
| Component | Details |
|-----------|---------|
| **Architecture** | Longformer (allenai/longformer-base-4096) |
| **Task** | Multi-label classification |
| **Max Sequence** | 4096 tokens |
| **Labels** | IPC sections (multi-label) |

## 📁 Files Not in Repository

The following files are excluded from git for size/security reasons:

| Path | Reason | Action Required |
|------|--------|-----------------|
| `model_data/` | Large model files (~1GB) | Obtain separately |
| `train.jsonl` | Training data (~320MB) | Not needed for inference |
| `*.db` | SQLite databases | Auto-generated on first run |
| `node_modules/` | Dependencies | Run `npm install` |
| `venv/` | Python virtual env | Run `python -m venv venv` |
| `.env` | Environment secrets | Create manually |

## 🧪 Development

### Linting

```bash
cd frontend-simple
npm run lint
```

### Building for Production

```bash
cd frontend-simple
npm run build
```

Production files will be in `frontend-simple/dist/`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Model not loading | Ensure all files exist in `model_data/` |
| CUDA out of memory | Model will auto-fallback to CPU |
| spaCy model missing | Run `python -m spacy download en_core_web_sm` |
| Firebase auth failing | Check Firebase config in `firebase.js` |

## 📝 License

This project is for educational and research purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for legal tech innovation**
