import React, { useState, useRef } from 'react';
import { X, Play, Loader2 } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showModal, setShowModal] = useState(true);

  const generateResponse = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-[#111] p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="mb-8 text-3xl font-bold">
              What would you like to learn more about?
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about a character, a scene, anything you'd like!"
              className="mb-4 w-full rounded-lg bg-[#222] p-4 text-white placeholder-gray-400"
              rows={4}
            />
            <button
              onClick={generateResponse}
              disabled={isLoading || !prompt.trim()}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>
      )}

      {audioUrl && !showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-[#111] p-6">
            <button
              onClick={() => setShowModal(true)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="mb-8 text-3xl font-bold">Follow-up Response</h2>
            <div className="mb-4 flex items-center space-x-4">
              <button
                onClick={() => audioRef.current?.play()}
                className="rounded-full bg-white p-3 text-black hover:bg-gray-200"
              >
                <Play size={24} />
              </button>
              <div className="h-1 flex-1 rounded-full bg-gray-600">
                <div className="h-full w-0 rounded-full bg-white transition-all duration-200"></div>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about a character, a scene, anything you'd like!"
              className="mb-4 w-full rounded-lg bg-[#222] p-4 text-white placeholder-gray-400"
              rows={4}
            />
            <button
              onClick={generateResponse}
              disabled={isLoading || !prompt.trim()}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Generate
            </button>
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;