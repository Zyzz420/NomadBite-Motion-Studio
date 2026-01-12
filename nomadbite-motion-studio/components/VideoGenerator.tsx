
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AspectRatio, GenerationStatus, GeneratedVideo } from '../types';

const LOADING_MESSAGES = [
  "Awakening the scene...",
  "Igniting cinematic lighting...",
  "Tracing natural movement paths...",
  "Capturing the culinary soul...",
  "Weaving motion into your story...",
  "Polishing the final frames..."
];

interface VideoGeneratorProps {
  onKeySelected: () => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onKeySelected }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Cinematic motion capturing silhouettes moving naturally in a vibrant kitchen. Warm, golden sunlight filters through the room. Subtle steam rises from cooking pots. Photorealistic textures, 8K resolution, storyteller focus.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [status, setStatus] = useState<GenerationStatus>({ isGenerating: false, message: '' });
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!image) return;

    setStatus({ isGenerating: true, message: "Initializing NomadBite Engine..." });
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setStatus(prev => ({ ...prev, message: LOADING_MESSAGES[messageIndex] }));
    }, 8000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed.");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
      
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: videoUrl,
        prompt: prompt,
        timestamp: Date.now()
      };

      setVideos(prev => [newVideo, ...prev]);
    } catch (error: any) {
      console.error("Generation Error:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        alert("API Key error. Please reconnect your key.");
        await window.aistudio.openSelectKey();
        onKeySelected();
      } else {
        alert("Studio encountered an error. Please try again.");
      }
    } finally {
      clearInterval(messageInterval);
      setStatus({ isGenerating: false, message: '' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
      {/* Studio Controls */}
      <section className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-zinc-900">Create Motion</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Upload your culinary canvas and let NomadBite breathe life into your story.
          </p>
        </div>

        {/* Upload Canvas */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
            image ? 'border-red-400 bg-red-50/10' : 'border-zinc-200 hover:border-red-400 bg-zinc-50/50'
          }`}
        >
          {image ? (
            <>
              <img src={image} alt="Studio Canvas" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold text-sm bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">Change Photo</span>
              </div>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 text-zinc-300 group-hover:text-red-500 group-hover:scale-110 transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-bold text-zinc-900">Drop your culinary capture</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">RAW • JPG • PNG</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={status.isGenerating}
          />
        </div>

        {/* Prompt Sculptor */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Story Prompt</label>
            <span className="text-[10px] text-red-500 font-bold">VEO 3.1 ENGINE</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={status.isGenerating}
            placeholder="Describe the soul of the movement..."
            className="w-full h-32 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-red-400 focus:ring-4 focus:ring-red-50/50 transition-all outline-none resize-none text-zinc-800 text-sm font-medium leading-relaxed"
          />
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cinematic Format</label>
          <div className="flex gap-4">
            {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                disabled={status.isGenerating}
                className={`flex-1 py-4 px-4 rounded-2xl border-2 font-bold transition-all text-xs tracking-widest ${
                  aspectRatio === ratio 
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200 scale-[1.02]' 
                    : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'
                }`}
              >
                {ratio === '16:9' ? 'LANDSCAPE' : 'PORTRAIT'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={generateVideo}
          disabled={status.isGenerating || !image}
          className={`w-full py-5 px-6 rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all flex items-center justify-center gap-4 ${
            status.isGenerating || !image
              ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-red-100 hover:scale-[1.01] active:scale-[0.98]'
          }`}
        >
          {status.isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Developing Story...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Animate Capture</span>
            </>
          )}
        </button>

        {status.isGenerating && (
          <div className="p-5 bg-red-50/50 border border-red-100 rounded-2xl">
            <p className="text-red-700 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{status.message}</p>
          </div>
        )}
      </section>

      {/* Studio Showcase */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Studio Showcase</h2>
            <p className="text-zinc-400 text-xs font-medium">Your collection of nomadic stories</p>
          </div>
          <span className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{videos.length} REELS</span>
        </div>

        {videos.length === 0 ? (
          <div className="bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[2.5rem] h-[30rem] flex flex-col items-center justify-center text-zinc-300 p-10 text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="space-y-1">
                <p className="text-lg font-black text-zinc-900">Showcase is empty</p>
                <p className="text-xs font-medium max-w-[200px] mx-auto">Upload an image and animate it to start your nomadic journey.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {videos.map((vid) => (
              <div key={vid.id} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-zinc-100 transition-all hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)]">
                <div className="relative aspect-video bg-black group/vid">
                  <video 
                    src={vid.url} 
                    controls 
                    className="w-full h-full object-contain"
                    poster={image || undefined}
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md tracking-widest opacity-0 group-hover/vid:opacity-100 transition-opacity uppercase">
                    NomadBite Original
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-semibold text-zinc-800 leading-relaxed italic">"{vid.prompt}"</p>
                    <span className="text-[10px] font-bold text-zinc-300">{new Date(vid.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                    <div className="flex gap-2">
                         <span className="px-2 py-1 bg-zinc-100 rounded text-[9px] font-black text-zinc-500 tracking-tighter">720P</span>
                         <span className="px-2 py-1 bg-zinc-100 rounded text-[9px] font-black text-zinc-500 tracking-tighter">MP4</span>
                    </div>
                    <a 
                      href={vid.url} 
                      download={`nomadbite-${vid.id}.mp4`}
                      className="group flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest hover:text-red-700 transition-colors"
                    >
                      <span>Export Archive</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
