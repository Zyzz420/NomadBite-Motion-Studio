
import React, { useState, useEffect } from 'react';
import { VideoGenerator } from './components/VideoGenerator';
import { ApiKeySelection } from './components/ApiKeySelection';

// Define the interface for the AI Studio global object to ensure type safety
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Removed readonly modifier to match potential existing declarations and avoid conflict
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } catch (e) {
      console.error("Error checking API key status:", e);
      setHasApiKey(false);
    }
  };

  const handleKeySelected = () => {
    setHasApiKey(true);
  };

  if (hasApiKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-pulse text-zinc-400">Initializing NomadBite...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-900">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-200">N</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">NomadBite</h1>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Motion Studio</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {!hasApiKey ? (
            <button 
              onClick={() => window.aistudio.openSelectKey().then(handleKeySelected)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-full transition-colors font-medium"
            >
              Connect Key
            </button>
          ) : (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-medium text-xs">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               System Online
             </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {!hasApiKey ? (
          <ApiKeySelection onKeySelected={handleKeySelected} />
        ) : (
          <VideoGenerator onKeySelected={handleKeySelected} />
        )}
      </main>

      <footer className="mt-20 border-t border-zinc-100 p-8 text-center text-zinc-400 text-xs">
        <div className="flex justify-center gap-6 mb-4 font-medium uppercase tracking-widest">
            <span>Nomadic Spirit</span>
            <span>•</span>
            <span>Cinematic Soul</span>
            <span>•</span>
            <span>Traditional Heart</span>
        </div>
        <p>© 2024 NomadBite Studio. Powered by Gemini Veo 3.1.</p>
      </footer>
    </div>
  );
};

export default App;
