import { useState, useEffect } from "react";
import axios from "axios";
import { auth, loginWithGoogle, logout } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Scale,
  History,
  LogOut,
  ArrowRight,
  Loader2,
  FileText,
  User,
  Sparkles
} from "lucide-react";

// --- CONFIG ---
const API_URL = "http://127.0.0.1:8000";

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [history, setHistory] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setAnalyzing(true);
    setPredictions([]); // Clear old results

    try {
      const res = await axios.post(`${API_URL}/predict`, {
        text: inputText,
        user_id: user.uid,
      });
      setPredictions(res.data.predictions);
      fetchHistory(user.uid);
    } catch (err) {
      console.error("Prediction failed", err);
      alert("Error connecting to Backend. Is it running?");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadFromHistory = (item) => {
    setInputText(item.text);
    setPredictions(item.results);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Legal AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="w-full max-w-md px-6">
          <div className="bg-card p-10 rounded-2xl shadow-2xl border border-border">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Legal AI Assistant
                </h1>
                <p className="text-muted-foreground">
                  Case Analysis & Instant IPC to BNS Translation
                </p>
              </div>
              <button
                onClick={loginWithGoogle}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
              <p className="text-xs text-muted-foreground">
                Secure authentication powered by Google
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 5. DASHBOARD UI ---
  return (
    <div className="flex h-screen bg-background text-foreground">

      {/* SIDEBAR */}
      <aside className="w-80 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Scale className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">LegalAI</h2>
              <p className="text-xs text-sidebar-foreground/60">Case Analyzer</p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="flex items-center gap-2 px-2 py-3 text-sidebar-foreground/80">
            <History className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Recent Cases
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {history.length === 0 && (
              <div className="text-center py-8 px-4">
                <FileText className="w-8 h-8 text-sidebar-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-sidebar-foreground/50">No history yet</p>
              </div>
            )}
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-full p-3 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg text-left transition-all group border border-sidebar-border/50 hover:border-sidebar-primary/50"
              >
                <p className="text-sm text-sidebar-foreground line-clamp-2 mb-2 group-hover:text-sidebar-primary transition-colors">
                  {item.text}
                </p>
                <p className="text-xs text-sidebar-foreground/50 font-mono">
                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 p-3 bg-sidebar-accent rounded-lg">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-10 h-10 rounded-full border-2 border-sidebar-primary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 text-sm font-medium text-destructive-foreground bg-destructive/90 hover:bg-destructive rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center lg:hidden">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Case Analysis</h1>
              <p className="text-xs text-muted-foreground">IPC to BNS Legal Translation</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {user.displayName?.split(' ')[0]}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Input Section */}
          <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Case Details</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Describe the incident to analyze applicable laws
              </p>
            </div>

            <div className="p-6">
              <textarea
                className="w-full p-4 border-2 border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none text-base leading-relaxed transition-all bg-background placeholder:text-muted-foreground"
                rows="6"
                placeholder="Example: The accused was found with illegal substances during a routine check. The quantity recovered was approximately 50 grams of a controlled substance..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !inputText.trim()}
                  className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 flex items-center gap-2 ${analyzing || !inputText.trim()
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95"
                    }`}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Case
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {analyzing && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card rounded-2xl shadow-md border border-border p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-8 w-24 bg-muted rounded-lg"></div>
                    <div className="h-6 w-6 bg-muted rounded"></div>
                    <div className="h-8 w-24 bg-muted rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {predictions.length > 0 && !analyzing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Legal Analysis Results
                </h2>
                <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  {predictions.length} {predictions.length === 1 ? 'Match' : 'Matches'}
                </span>
              </div>

              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-ipc rounded-lg border-2 border-ipc/30">
                          <span className="text-sm font-bold text-white">
                            {pred.ipc_code.replace("IPC_", "IPC ")}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="px-4 py-2 bg-bns rounded-lg border-2 border-bns/30">
                          <span className="text-sm font-bold text-white">
                            {pred.bns_code}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-md ${pred.confidence > 0.7
                            ? "bg-bns"
                            : pred.confidence > 0.5
                              ? "bg-primary"
                              : "bg-secondary"
                          }`}>
                          {(pred.confidence * 100).toFixed(0)}% Match
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* IPC Side */}
                    <div className="p-6 bg-ipc-bg/30 border-b lg:border-b-0 lg:border-r border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-ipc"></div>
                        <h4 className="text-xs font-bold text-ipc uppercase tracking-wider">
                          Old Law (IPC)
                        </h4>
                      </div>
                      <h3 className="font-bold text-foreground mb-3 text-base">
                        {pred.ipc_title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pred.ipc_desc}
                      </p>
                    </div>

                    {/* BNS Side */}
                    <div className="p-6 bg-bns-bg/30">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-bns"></div>
                        <h4 className="text-xs font-bold text-bns uppercase tracking-wider">
                          New Law (BNS)
                        </h4>
                      </div>
                      <h3 className="font-bold text-foreground mb-3 text-base">
                        {pred.bns_title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pred.bns_desc}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {predictions.length === 0 && !analyzing && inputText && (
            <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed border-border">
              <Scale className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Click "Analyze Case" to see results
              </p>
            </div>
          )}

          {/* Initial State */}
          {predictions.length === 0 && !analyzing && !inputText && (
            <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-border">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                Ready to Analyze
              </h3>
              <p className="text-muted-foreground">
                Enter case details above to begin legal analysis
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
