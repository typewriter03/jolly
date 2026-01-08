import re
import wordninja
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None
    print("⚠️ Warning: SpaCy model not found. Using regex fallback.")

DATE_RE = re.compile(r"\b\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}\b")

FIR_RE = re.compile(r"\b(FIR|F\.I\.R\.?|Crime(?: No\.?)?)\s*(?:No\.?)?[:\s#]*[\d\-\/]+\b", re.IGNORECASE)

CASE_RE = re.compile(r"\b(Cr\.?\s?No\.?|Criminal\s+No\.?|Case\s+No\.?|C\.A\.?\s?No\.?)[:\s#]*[\w\-\/]+\b", re.IGNORECASE)

def mask_legal_patterns(text: str) -> str:
    text = DATE_RE.sub("<DATE>", text)
    text = FIR_RE.sub("<FIR>", text)
    text = CASE_RE.sub("<CASE>", text)
    return text

def fix_merged_words(text: str) -> str:
    tokens = text.split()
    fixed = []
    for t in tokens:
        if len(t) > 10: 
             fixed.append(" ".join(wordninja.split(t)))
        else:
             fixed.append(t)
    return " ".join(fixed)

def preprocess_text(text: str) -> str:
    text = fix_merged_words(text)
    
    if nlp:
        doc = nlp(text)
        text_list = list(text)
        for ent in reversed(doc.ents):
            if ent.label_ in ["PERSON"]:
                text_list[ent.start_char:ent.end_char] = list("<PERSON>")
            elif ent.label_ in ["ORG"]:
                text_list[ent.start_char:ent.end_char] = list("<ORG>")
            elif ent.label_ in ["GPE", "LOC"]:
                text_list[ent.start_char:ent.end_char] = list("<LOCATION>")
        text = "".join(text_list)
    
    text = mask_legal_patterns(text)
    
    return text