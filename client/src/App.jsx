import AudioRecorder from "./components/AudioRecorder";
import { useState } from "react";
import TaskCard from "./components/TaskCard";
import 'ldrs/react/DotStream.css'
import { DotStream } from "ldrs/react";


function App() {

  const [transcriptedText, setTranscriptedText] = useState("");
  const [transcriptedTasks, setTranscriptedTasks] = useState(["Tap & record your to-dos in a casual tone and get them tailored for you.",]); 

  const [loading, setLoading] = useState(false);

  const handleRecordingComplete = async(blob) => {
    console.log("Recording complete:", blob);
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try{
      const response = await fetch("http://localhost:5000/upload",{
        method:"POST",
        body:formData,
      })

      const result = await response.json();
      console.log("Server response:", result);

      setTranscriptedText(result.transcription);
      console.log("Transcripted text:", result.transcription);
      // need to fetch the tasks
      
      setTranscriptedTasks(result.tasks);
      console.log("Transcripted tasks:", result.tasks);

    }
    catch(error){
      console.error("Upload failed",error);
    }
    setLoading(false);
  };

  

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">

    {/* Header */}
    <header className="  w-full text-center mt-10 relative">
      <h1 className="text-4xl font-bold text-white tracking-wide">
        Voice<span className="text-[#88E788]">2</span>Task
      </h1>
      <p className="mt-2 text-gray-400 text-sm">Your AI-powered to-do assistant</p>
        
    </header>

    {/* Loader while data comes  */}
    

    {/* Scrollable Task Container */}
    <div className="flex-1 w-full flex justify-center mt-6 px-1 overflow-y-auto">
      <div className="w-full sm:w-[60%] space-y-2 pb-32">
        {transcriptedTasks.map((task, index) => (
          <TaskCard key={index} task={task} />
        ))}
      </div>
    </div>

    {/* Sticky Mic Button */}
    <div className="fixed bottom-3 left-0 w-full flex flex-col justify-center bg-black z-50 py-4">
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        transcriptedText={transcriptedText}
      />
      {loading &&( <div className="justify-center items-center mx-auto -mb-4 mt-2">
        <DotStream size="60" speed="2.5"color="#88E788"  />
        </div>)}
    </div>
  </div>
  );
}

export default App;
