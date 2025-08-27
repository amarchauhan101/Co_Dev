import React, { useState, useRef } from 'react';
import VoiceChat from './VoiceChat';
import { useAuth } from '../../context/AuthContext';

const VoiceChatTest = () => {
  const { user } = useAuth();
  const [testProjectId] = useState('68a5acd4ba5173cb9c23616a'); // Use your test project ID
  const [audioTest, setAudioTest] = useState(null);
  const audioRef = useRef(null);
  const token = user?.userWithToken?.token;

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioTest('✅ Microphone access granted');
      
      // Play the stream back to test audio
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }
      
      // Stop the test stream after 3 seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setAudioTest('✅ Microphone test completed');
      }, 3000);
      
    } catch (err) {
      setAudioTest('❌ Microphone access denied: ' + err.message);
    }
  };

  if (!token) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Please log in to test voice chat
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Voice Chat Test</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open this page in two different browser tabs/windows</li>
          <li>Click "Start Voice Chat" in both tabs</li>
          <li>Allow microphone access when prompted</li>
          <li>You should see the user count increase</li>
          <li>Try speaking - you should hear yourself in the other tab</li>
          <li>Test mute/unmute functionality</li>
        </ol>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 className="text-md font-semibold mb-2">Audio Test:</h3>
        <button 
          onClick={testMicrophone}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mb-2"
        >
          Test Microphone
        </button>
        {audioTest && <p className="text-sm">{audioTest}</p>}
        <audio ref={audioRef} autoPlay muted className="hidden" />
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 className="text-md font-semibold mb-2">Current Status:</h3>
        <p><strong>User:</strong> {user?.userWithToken?.username || 'Unknown'}</p>
        <p><strong>Project ID:</strong> {testProjectId}</p>
        <p><strong>Token:</strong> {token ? '✅ Available' : '❌ Missing'}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Voice Chat Component:</h3>
        <VoiceChat projectId={testProjectId} token={token} />
      </div>

      <div className="mt-6 text-xs text-gray-400">
        <p><strong>Debug Tips:</strong></p>
        <ul className="list-disc list-inside">
          <li>Check browser console for VoiceChat logs</li>
          <li>Check backend terminal for voice room events</li>
          <li>Make sure microphone permissions are granted</li>
          <li>Try using Chrome/Edge for better WebRTC support</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceChatTest;
