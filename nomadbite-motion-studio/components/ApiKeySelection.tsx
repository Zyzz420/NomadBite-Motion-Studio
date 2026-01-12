
import React from 'react';

interface ApiKeySelectionProps {
  onKeySelected: () => void;
}

export const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onKeySelected }) => {
  const handleOpenSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      onKeySelected();
    } catch (e) {
      console.error("Failed to open key selection dialog:", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-8">
      <div className="relative">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-2 transform rotate-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Access the Studio</h2>
        <p className="text-zinc-500 leading-relaxed">
          NomadBite uses high-performance Veo 3.1 models. Please select your paid project API key to continue.
        </p>
      </div>
      <div className="bg-zinc-50 p-6 rounded-2xl text-sm text-left border border-zinc-100 w-full">
        <p className="font-bold text-zinc-900 mb-2 uppercase tracking-wide text-[10px]">Security & Requirements</p>
        <ul className="space-y-2 text-zinc-500">
          <li className="flex gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Billing must be enabled on your GCP project.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Check <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-red-600 underline font-semibold decoration-red-200 hover:decoration-red-600 transition-all">Billing Docs</a>.</span>
          </li>
        </ul>
      </div>
      <button
        onClick={handleOpenSelectKey}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-red-100 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg"
      >
        Select API Key
      </button>
    </div>
  );
};
