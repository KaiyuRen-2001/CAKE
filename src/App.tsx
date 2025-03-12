import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import OpenAI from 'openai';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Not checked');
  const [answer, setAnswer] = useState<string>('');

  // Check if API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setApiKeyStatus('Missing API key');
      console.error('OpenAI API key is missing');
    } else {
      const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5);
      setApiKeyStatus(`Available (${maskedKey})`);
      // console.log('OpenAI API key is available:', maskedKey);
    }
  }, []);

  const generateResponse = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    console.log("Starting to generate response for prompt:", prompt);
    try {
      // Create OpenAI client directly in the frontend
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });

      // First, get an answer to the user's question using chat completion
      console.log("Calling OpenAI Chat API to get an answer...");
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant providing concise and informative answers." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
      });
      
      // Extract the answer from the chat completion response
      const aiAnswer = chatResponse.choices[0]?.message?.content || "I'm sorry, I couldn't generate an answer.";
      console.log("Received answer from OpenAI:", aiAnswer);
      setAnswer(aiAnswer);

      // Now convert the answer to speech
      console.log("Calling OpenAI TTS API to convert answer to speech...");
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: aiAnswer,
      });
      
      console.log("OpenAI TTS API response received");
      
      // Convert the response to a blob and create a URL
      const buffer = await response.arrayBuffer();
      console.log("Response converted to array buffer, size:", buffer.byteLength);
      
      const audioBlob = new Blob([buffer], { type: 'audio/mpeg' });
      console.log("Audio blob created, size:", audioBlob.size);
      
      const url = URL.createObjectURL(audioBlob);
      console.log("Audio URL created:", url);
      
      setAudioUrl(url);
      console.log("Audio URL set in state");
      
      // Close the modal to show the audio player
      setShowModal(false);
      console.log("Modal closed to show audio player");
      
      // Make sure the audio element is properly set up before playing
      if (audioRef.current) {
        console.log("Audio element found, attempting to play");
        
        // Add event listeners to track audio playback
        audioRef.current.onplay = () => console.log("Audio started playing");
        audioRef.current.onended = () => console.log("Audio finished playing");
        audioRef.current.onerror = (e) => console.error("Audio playback error:", e);
        
        // Try to play the audio
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => console.log("Audio playback started successfully"))
              .catch(error => console.error("Audio playback failed:", error));
          }
        } catch (playError) {
          console.error("Error during play() call:", playError);
        }
      } else {
        console.error("Audio element reference is null");
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
      console.log("Generation process completed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fallback audio element for debugging */}
      {/* {audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4">
          <p className="mb-2 text-sm text-gray-300">Debug Audio Player:</p>
          <audio src={audioUrl} controls className="w-full" />
          <p className="mt-2 text-xs text-gray-400">Audio URL: {audioUrl}</p>
          <p className="text-xs text-gray-400">API Key Status: {apiKeyStatus}</p>
        </div>
      )} */}
      
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
            
            {/* Display the AI's answer text */}
            <div className="mb-4 max-h-60 overflow-y-auto rounded-lg bg-[#222] p-4 text-white">
              {answer}
            </div>
            
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">Your Question:</h3>
              <div className="rounded-lg bg-[#333] p-3 text-gray-300">
                {prompt}
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Ask Another Question
            </button>
            
            <audio ref={audioRef} src={audioUrl} controls className="mt-4 w-full" />
            
            {/* Debug information */}
            {/* <div className="mt-4 rounded bg-gray-800 p-3 text-xs text-gray-300">
              <p>Debug Info:</p>
              <p>API Key Status: {apiKeyStatus}</p>
              <p>Audio URL: {audioUrl || 'None'}</p>
              <p>Audio Element Status: {audioRef.current ? 'Available' : 'Not Available'}</p>
              <p>Modal State: {showModal ? 'Showing' : 'Hidden'}</p>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;