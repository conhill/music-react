import React, { useState, useRef } from 'react';
import { Music } from 'lucide-react';
import ReactDOM from 'react-dom/client';

/**
 * BangerUploader - A React component that allows users to upload audio files
 * and analyze them using AI to determine if they're "bangers"
 */
export default function BangerUploader() {
  // State management
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    
    // Only accept audio files
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  };

  // File input change handler
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    // Only accept audio files
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
    }
  };

  /**
   * Processes audio file for AI analysis
   * - Extracts middle 10 seconds
   * - Converts to mono 22050Hz sample rate
   * - Returns as WAV blob
   */
  const processAudio = async (audioFile) => {
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 22050 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Calculate middle 10 seconds of the audio
      const duration = audioBuffer.duration;
      const startTime = Math.max(0, (duration - 10) / 2);
      const endTime = Math.min(duration, startTime + 10);
      const segmentLength = Math.floor((endTime - startTime) * 22050);
      const startSample = Math.floor(startTime * 22050);
      
      // Create new buffer for the 10-second segment (mono, 22050Hz)
      const processedBuffer = audioContext.createBuffer(1, segmentLength, 22050);
      const outputData = processedBuffer.getChannelData(0);
      
      // Convert to mono by averaging channels if stereo
      if (audioBuffer.numberOfChannels === 1) {
        const inputData = audioBuffer.getChannelData(0);
        for (let i = 0; i < segmentLength; i++) {
          outputData[i] = inputData[startSample + i] || 0;
        }
      } else {
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        for (let i = 0; i < segmentLength; i++) {
          const sampleIndex = startSample + i;
          outputData[i] = ((leftChannel[sampleIndex] || 0) + (rightChannel[sampleIndex] || 0)) / 2;
        }
      }
      
      // Convert to 16-bit WAV format
      const wavBuffer = audioBufferToWav(processedBuffer);
      return new Blob([wavBuffer], { type: 'audio/wav' });
      
    } catch (error) {
      console.error('Audio processing error:', error);
      throw new Error('Failed to process audio file');
    }
  };

  /**
   * Converts AudioBuffer to WAV format
   * Creates a proper WAV file with headers for 16-bit PCM audio
   */
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    // Helper function to write strings to the buffer
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    // Write WAV file header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true); // File size
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Format chunk size
    view.setUint16(20, 1, true); // Audio format (PCM)
    view.setUint16(22, channels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * channels * 2, true); // Byte rate
    view.setUint16(32, channels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, length * 2, true); // Data chunk size
    
    // Convert float samples to 16-bit PCM
    const samples = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };

  /**
   * Main analysis function
   * Processes audio and sends it to the AI API for banger classification
   */
  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      // Process the audio file for API requirements
      const processedAudio = await processAudio(file);
      console.log('Processed audio blob created:', processedAudio);

      // Prepare FormData for API submission
      const formData = new FormData();
      formData.append('file', processedAudio, 'processed_audio.wav');
      
      // Send to Flask API for AI analysis
      const response = await fetch('https://music-flask-api.onrender.com/predict', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      setIsProcessing(false);
      
      // Process and display results
      displayResults(result);
      
    } catch (error) {
      setIsProcessing(false);
      console.error('Analysis error:', error);
      alert(
        `Error analyzing audio: ${error.message}\n\n` +
        'Make sure the Flask API is running at https://music-flask-api.onrender.com/'
      );
    }
  };

  /**
   * Displays the AI analysis results to the user
   */
  const displayResults = (result) => {
    const isBanger = result.prediction.toLowerCase() === 'bangers' || result.score > 0.5;
    const scorePercent = Math.round(result.score * 100);
    
    if (isBanger) {
      alert(
        `🔥 IT'S A BANGER! 🔥\n\n` +
        `Prediction: ${result.prediction}\n` +
        `Confidence: ${scorePercent}%\n\n` +
        `This track is certified fire! 🎵`
      );
    } else {
      alert(
        `😅 Not quite a banger...\n\n` +
        `Prediction: ${result.prediction}\n` +
        `Confidence: ${scorePercent}%\n\n` +
        `Maybe try a different track? 🎶`
      );
    }
  };

  /**
   * Formats file size in human-readable format
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 relative overflow-hidden">
      {/* Animated wave background */}
      <AnimatedBackground />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl p-12 max-w-2xl w-full shadow-2xl border border-white border-opacity-30">
          
          {/* Project Title */}
          <Header />

          {/* Upload Zone */}
          <UploadZone 
            file={file}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
            formatFileSize={formatFileSize}
          />

          {/* Analyze Button */}
          {file && !isProcessing && (
            <AnalyzeButton onClick={handleAnalyze} />
          )}

          {/* Processing State */}
          {isProcessing && <ProcessingIndicator />}

          {/* Supported Formats */}
          <SupportedFormats />
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BangerUploader />);

// UI Components
/**
 * Animated background waves component
 */
const AnimatedBackground = () => (
  <div className="absolute inset-0">
    <svg className="absolute w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
      <path
        d="M0,300 Q300,200 600,300 T1200,300 V600 H0 Z"
        fill="rgba(255,255,255,0.1)"
        className="animate-pulse"
      />
      <path
        d="M0,350 Q300,250 600,350 T1200,350 V600 H0 Z"
        fill="rgba(255,255,255,0.05)"
        style={{ animationDelay: '1s' }}
        className="animate-pulse"
      />
    </svg>
  </div>
);

/**
 * Floating particles background component
 */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div 
      className="absolute top-1/4 left-3/4 w-32 h-32 bg-white bg-opacity-10 rounded-full animate-bounce" 
      style={{ animationDelay: '0s', animationDuration: '6s' }}
    />
    <div 
      className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-white bg-opacity-8 rounded-full animate-bounce" 
      style={{ animationDelay: '2s', animationDuration: '8s' }}
    />
    <div 
      className="absolute top-1/2 right-1/4 w-20 h-20 bg-white bg-opacity-6 rounded-full animate-bounce" 
      style={{ animationDelay: '4s', animationDuration: '7s' }}
    />
  </div>
);

/**
 * Header component with title and description
 */
const Header = () => (
  <div className="text-center mb-12">
    <h1 className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
      <Music className="text-orange-500" size={48} />
      Is it a Banger?
    </h1>
    <p className="text-gray-600 text-xl font-medium">
      Drop your track and let AI determine if it's a certified banger 🔥
    </p>
  </div>
);

/**
 * File upload zone component
 */
const UploadZone = ({ 
  file, 
  isDragOver, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileSelect, 
  fileInputRef, 
  formatFileSize 
}) => (
  <div
    className={`border-3 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer ${
      isDragOver
        ? 'border-orange-500 bg-orange-50 scale-105'
        : 'border-gray-300 bg-gradient-to-br from-orange-50 to-amber-50'
    } ${file ? 'border-green-500 bg-green-50' : ''}`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={() => fileInputRef.current?.click()}
  >
    <input
      ref={fileInputRef}
      type="file"
      accept="audio/*"
      onChange={onFileSelect}
      className="hidden"
    />

    {!file ? (
      <div className="mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Music className="text-white" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Drop your audio file here
        </h3>
        <p className="text-gray-600 mb-6">
          or click to browse your files
        </p>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300">
          Choose Audio File
        </button>
      </div>
    ) : (
      <div className="text-left bg-green-100 border-2 border-green-500 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Music className="text-white" size={24} />
          </div>
          <div>
            <p className="font-bold text-green-800 text-lg">{file.name}</p>
            <p className="text-green-700">{formatFileSize(file.size)}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

/**
 * Analyze button component
 */
const AnalyzeButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-8 rounded-2xl font-bold text-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
  >
    <Music size={24} />
    Analyze This Banger!
  </button>
);

/**
 * Processing indicator component
 */
const ProcessingIndicator = () => (
  <div className="mt-8 text-center">
    <div className="flex items-center justify-center gap-4 text-orange-600 text-xl font-bold">
      <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      Processing audio: extracting middle 10 seconds, converting to 22050Hz mono...
    </div>
    <p className="text-gray-600 mt-2">
      This might take a moment while our AI judges your track 🎵
    </p>
  </div>
);

/**
 * Supported formats footer component
 */
const SupportedFormats = () => (
  <div className="mt-12 pt-8 border-t border-gray-200 text-center">
    <p className="text-gray-500 text-sm">
      Supported formats: MP3, WAV, FLAC, AAC, OGG
    </p>
  </div>
);