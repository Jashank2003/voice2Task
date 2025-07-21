import { useState, useRef } from "react";
import { Mic } from "lucide-react";
import { Quantum } from 'ldrs/react'
import 'ldrs/react/Quantum.css'



// Default values shown


// Default values shown


const AudioRecorder = ({ onRecordingComplete , transcriptedText}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      onRecordingComplete(blob);
      chunks.current = [];
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  return (
    <div className="flex flex-col items-center">
        {/* <p className="text-white p-4 rounded-md center align-center w-[80%] m-auto">{transcriptedText}</p> */}
        <button
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition duration-300 focus:outline-none bg-gray-700 ${
                isRecording ? "border-2 border-purple-500" : ""
            }`}
            >
            {isRecording ? (
                <Quantum size="40" speed="1.75"color="#88E788"/>
            ) : (
                <Mic size={32} />
            )}
            </button>
    </div>
  );
};

export default AudioRecorder;
