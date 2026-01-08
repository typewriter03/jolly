import json
import torch
import os
import re
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi.staticfiles import StaticFiles

import preprocessing
import database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



database.init_db()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

MODEL_DIR = "../model_data"
LABEL_MAP_PATH = "../model_data/id2label.json"
BNS_MAP_PATH = "../mappings/ipc_to_bns.json"

print("🔄 Initializing Backend...")

try:
    with open("../mappings/ipc_to_bns.json", "r", encoding="utf-8") as f:
        ipc_data = json.load(f)
    print(f"✅ Loaded detailed mapping for {len(ipc_data)} sections.")
except Exception as e:
    print(f"⚠️ Error loading mapping: {e}")
    ipc_data = {}


try:
    with open(LABEL_MAP_PATH, "r") as f:
        raw_labels = json.load(f)
        custom_id2label = {int(k): v for k, v in raw_labels.items()}
    print(f"✅ Loaded {len(custom_id2label)} labels from {LABEL_MAP_PATH}")
except Exception as e:
    print(f"❌ ERROR: Could not load id2label.json. {e}")
    custom_id2label = {}

try:
    with open(BNS_MAP_PATH, "r") as f:
        ipc_to_bns = json.load(f)
    print(f"✅ Loaded BNS mapping.")
except Exception as e:
    print(f"⚠️ Warning: BNS Mapping not found. {e}")
    ipc_to_bns = {}

try:
    print("⏳ Loading Model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()
    
    print(f"✅ Longformer loaded on {device}.")
    
except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")
    model = None


class CaseRequest(BaseModel):
    text: str
    user_id: str

@app.post("/predict")
async def predict(request: CaseRequest, db: Session = Depends(get_db)):
    if not model:
        raise HTTPException(500, "Model not loaded")

    
    request.text = request.text.replace('"', '') 
    
    clean_text = preprocessing.preprocess_text(request.text)
    
    
    inputs = tokenizer(clean_text, return_tensors="pt", truncation=True, max_length=4096)
    inputs = {k: v.to(model.device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # C. Decoding
    probs = torch.sigmoid(outputs.logits[0])
    top_k = torch.topk(probs, 5)
    top_scores = top_k.values
    top_indices = top_k.indices

    results = []
    for score, idx in zip(top_scores, top_indices):
        idx = int(idx)
        
        # 1. Get Label
        ipc_label_full = custom_id2label.get(idx, f"LABEL_{idx}")
        
        # 2. Extract Number
        import re
        match = re.search(r"IPC_([0-9]+[A-Za-z]*)", ipc_label_full)
        section_number = match.group(1) if match else ipc_label_full
        print(f"🔍 Searching for Key: '{section_number}' in {len(ipc_data)} records...")
        
        # 3. Lookup Details
        details = ipc_data.get(section_number)
        
        if details:
            result_obj = {
                "ipc_code": f"IPC {details['ipc_code']}",
                "ipc_title": details['ipc_title'],
                "ipc_desc": details['ipc_description'],
                "bns_code": details['bns_code'],
                "bns_title": details['bns_title'],
                "bns_desc": details['bns_description'],
                "confidence": float(score)
            }
        else:
            result_obj = {
                "ipc_code": ipc_label_full,
                "ipc_title": "Title not found",
                "ipc_desc": "Description not available.",
                "bns_code": "Consult BNS",
                "bns_title": "-",
                "bns_desc": "-",
                "confidence": float(score)
            }
            
        results.append(result_obj)
        
    
    try:
        history_entry = database.SearchHistory(
            user_id=request.user_id, 
            query_text=request.text, 
            predictions_json=json.dumps(results)
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"DB Error: {e}")

    return {"predictions": results}

@app.get("/history/{user_id}")
def get_history(user_id: str, db: Session = Depends(get_db)):
    history = db.query(database.SearchHistory).filter_by(user_id=user_id).order_by(database.SearchHistory.timestamp.desc()).limit(50).all()
    return [{"id": h.id, "text": h.query_text, "results": json.loads(h.predictions_json), "timestamp": h.timestamp} for h in history]

@app.delete("/history/{user_id}")
def clear_user_history(user_id: str, db: Session = Depends(get_db)):
    """Deletes all search history for a specific user."""
    try:
        # Find all records for this user
        db.query(database.SearchHistory)\
          .filter(database.SearchHistory.user_id == user_id)\
          .delete(synchronize_session=False)
        
        db.commit()
        return {"status": "success", "message": "History cleared"}
    except Exception as e:
        print(f"❌ Error clearing history: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear history")