# Rewind

## Features

### Voice Input for Questions
- Click the "Ask a Question" button to start recording your question
- Speak clearly into your microphone
- Click "Stop Recording" when finished
- Review your transcribed question before submitting

### Customizable AI Responses
- **Voice Selection**: Choose from multiple AI voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer, Ash)
- **Response Length**: Select short, medium, or detailed responses based on your preference
- **Playback Speed**: Adjust the speed of the audio response (0.8x, 1.0x, 1.2x, 1.5x)

### Enhanced User Experience
- **Audio Cues**: Receive audio feedback when starting and stopping recordings
- **Markdown Formatting**: Responses are formatted with clear headings and structure for better readability
- **Review & Revise**: Edit your question before generating a response

## How to Use

1. Click "Ask a Question" to start recording your query
2. Speak your question clearly
3. Click "Stop Recording" when finished
4. Review the transcribed text and edit if necessary
5. (Optional) Click "Settings" to customize the AI voice and response length
6. Click "Generate" to get your answer
7. Listen to the response and adjust playback speed as needed
8. Click "Ask Another Question" to continue exploring

## Technical Implementation

This application uses:
- OpenAI's Whisper API for speech-to-text conversion
- OpenAI's GPT-4o for generating informative responses
- OpenAI's TTS (Text-to-Speech) API for converting text responses to speech
- React and TypeScript for the frontend interface
- Markdown rendering for formatted text response

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Add your OpenAI API key to the `.env` file
4. Run the development server with `npm run dev`
5. Open your browser to the local development URL 