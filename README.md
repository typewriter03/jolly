# Legal Statute Pipeline

An AI-powered application that classifies legal case text and maps IPC (Indian Penal Code) sections to their corresponding BNS (Bharatiya Nyaya Sanhita) equivalents using a fine-tuned Longformer model.

## 🌟 Features

- **Legal Text Classification**: Analyze case descriptions and predict applicable IPC sections
- **IPC to BNS Mapping**: Automatic conversion from legacy IPC codes to new BNS codes
- **Search History**: Firebase-authenticated users can track their search history
- **Modern UI**: Responsive React frontend with TailwindCSS styling

## 🏗️ Architecture

```
legal-statute-pipeline/
├── backend/           # FastAPI Python server
│   ├── main.py        # API endpoints
│   ├── database.py    # SQLAlchemy models
│   └── preprocessing.py # Text preprocessing
├── frontend-simple/   # React + Vite frontend
│   └── src/           # React components
├── model_data/        # Fine-tuned Longformer model
└── mappings/          # IPC to BNS mapping files
```

## 📋 Prerequisites

- **Python**: 3.9+
- **Node.js**: 18+
- **CUDA** (optional): For GPU acceleration

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
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

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 3. Frontend Setup

```bash
cd frontend-simple

# Install dependencies
npm install
```

### 4. Model Setup

Ensure the `model_data/` directory contains:
- `config.json` - Model configuration
- `pytorch_model.bin` or `model.safetensors` - Model weights
- `tokenizer.json` - Tokenizer files
- `id2label.json` - Label mapping

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend-simple
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Classify legal text and return IPC/BNS predictions |
| `GET` | `/history/{user_id}` | Get search history for a user |
| `DELETE` | `/history/{user_id}` | Clear search history for a user |

### Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "theft of property from residence", "user_id": "user123"}'
```

### Example Response

```json
{
  "predictions": [
    {
      "ipc_code": "IPC 379",
      "ipc_title": "Punishment for theft",
      "ipc_desc": "Whoever commits theft...",
      "bns_code": "BNS 303",
      "bns_title": "Punishment for theft",
      "bns_desc": "Whoever commits theft...",
      "confidence": 0.92
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Optional: Set model path if different from default
MODEL_DIR=../model_data
```

### Firebase Configuration

Update `frontend-simple/src/firebase.js` with your Firebase project credentials.

## 🧪 Development

### Linting Frontend

```bash
cd frontend-simple
npm run lint
```

### Building for Production

```bash
cd frontend-simple
npm run build
```

## 📊 Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face library for Longformer model
- **SQLAlchemy** - Database ORM
- **spaCy** - NLP preprocessing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS
- **Firebase** - Authentication
- **Axios** - HTTP client

## 📝 License

This project is for educational/research purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
