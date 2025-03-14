import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Loader2, Volume2, Settings } from 'lucide-react';
import OpenAI from 'openai';

// Define types for our new features
type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'ash';
type ResponseLength = 'short' | 'medium' | 'detailed';
type PlaybackSpeed = 0.8 | 1.0 | 1.2 | 1.5;

// Update VoiceOption to include gender
const voiceOptions: { name: VoiceOption; gender: string }[] = [
  { name: 'alloy', gender: 'male' },
  { name: 'echo', gender: 'female' },
  { name: 'fable', gender: 'female' },
  { name: 'onyx', gender: 'male' },
  { name: 'nova', gender: 'female' },
  { name: 'shimmer', gender: 'female' },
  { name: 'ash', gender: 'male' }
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Not checked');
  const [answer, setAnswer] = useState<string>('');
  
  // New state variables for our features
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('ash');
  const [responseLength, setResponseLength] = useState<ResponseLength>('medium');
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [showSettings, setShowSettings] = useState(false);

  // Add a button to start and stop recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

  // Effect to apply playback speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioUrl]);

  // Get max tokens based on response length
  const getMaxTokens = (length: ResponseLength): number => {
    switch (length) {
      case 'short': return 150;
      case 'medium': return 300;
      case 'detailed': return 500;
      default: return 300;
    }
  };

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
      console.log(`Using response length: ${responseLength} (${getMaxTokens(responseLength)} tokens)`);
      
      // Adjust system prompt based on response length
      let systemPrompt = "You are a helpful assistant providing informative answers about TV shows.";
      if (responseLength === 'short') {
        systemPrompt += " Keep your answers brief and to the point, around 2-3 sentences.";
      } else if (responseLength === 'detailed') {
        systemPrompt += " Provide detailed and comprehensive answers with examples and context.";
      }
      
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: getMaxTokens(responseLength),
      });
      
      // Extract the answer from the chat completion response
      const aiAnswer = chatResponse.choices[0]?.message?.content || "I'm sorry, I couldn't generate an answer.";
      console.log("Received answer from OpenAI:", aiAnswer);
      setAnswer(aiAnswer);

      // Now convert the answer to speech
      console.log(`Calling OpenAI TTS API with voice: ${selectedVoice}`);
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice,
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
        
        // Set the playback speed
        audioRef.current.playbackRate = playbackSpeed;
        
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

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('MediaDevices API or getUserMedia not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const audioBlob = new Blob([event.data], { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');
          formData.append('model', 'whisper-1');

          // Call OpenAI Whisper API
          const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
            },
            body: formData
          });

          // Log the response status and text for debugging
          console.log('Response status:', response.status);
          const responseText = await response.text();
          console.log('Response text:', responseText);

          const result = JSON.parse(responseText);
          if (result.text) {
            setPrompt(result.text);
          } else {
            console.error('Transcription failed:', result);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Component for voice selection
  const VoiceSelector = () => (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">Voice</label>
      <div className="grid grid-cols-3 gap-2">
        {voiceOptions.map(({ name, gender }) => (
          <button
            key={name}
            onClick={() => setSelectedVoice(name)}
            className={`py-2 px-3 rounded-md text-sm capitalize ${
              selectedVoice === name 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#333] text-gray-300 hover:bg-[#444]'
            }`}
          >
            {`${name} (${gender})`}
          </button>
        ))}
      </div>
    </div>
  );

  // Component for response length selection
  const ResponseLengthSelector = () => (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">Response Length</label>
      <div className="grid grid-cols-3 gap-2">
        {(['short', 'medium', 'detailed'] as ResponseLength[]).map((length) => (
          <button
            key={length}
            onClick={() => setResponseLength(length)}
            className={`py-2 px-3 rounded-md text-sm capitalize ${
              responseLength === length 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#333] text-gray-300 hover:bg-[#444]'
            }`}
          >
            {length}
          </button>
        ))}
      </div>
    </div>
  );

  // Component for playback speed selection
  const PlaybackSpeedSelector = () => (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">Playback Speed</label>
      <div className="grid grid-cols-4 gap-2">
        {([0.8, 1.0, 1.2, 1.5] as PlaybackSpeed[]).map((speed) => (
          <button
            key={speed}
            onClick={() => setPlaybackSpeed(speed)}
            className={`py-2 px-3 rounded-md text-sm ${
              playbackSpeed === speed 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#333] text-gray-300 hover:bg-[#444]'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );

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
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                What would you like to learn more about?
              </h2>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#222]"
                title="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
            
            {showSettings && (
              <div className="mb-6 p-4 bg-[#222] rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Settings</h3>
                <VoiceSelector />
                <ResponseLengthSelector />
              </div>
            )}
            
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
            {/* Add buttons for recording inside the modal */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="w-full mt-4 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {isRecording ? 'Stop Recording' : 'Ask a question'}
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
            <h2 className="mb-6 text-3xl font-bold">AI Response</h2>
            
            <div className="mb-6 flex items-center space-x-4">
              <button
                onClick={() => audioRef.current?.play()}
                className="rounded-full bg-white p-3 text-black hover:bg-gray-200"
                title="Play"
              >
                <Play size={24} />
              </button>
              <div className="flex-1">
                <div className="h-1 w-full rounded-full bg-gray-600 mb-2">
                  <div className="h-full w-0 rounded-full bg-white transition-all duration-200"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Volume2 size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Voice: {selectedVoice}</span>
                  </div>
                  <div>
                    <PlaybackSpeedSelector />
                  </div>
                </div>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;