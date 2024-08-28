import useWhisper from "@chengsokdara/use-whisper";
import React, { useEffect, useState } from "react";

const TestingReactWisper = ({ name }) => {
  //   const {
  //     recording,
  //     speaking,
  //     transcribing,
  //     transcript,
  //     pauseRecording,
  //     startRecording,
  //     stopRecording,
  //   } = useWhisper({
  //     apiKey: "",
  //   });

  //   console.log({ recording, speaking, transcribing, transcript });

  //   return (
  //     <div className="p-2 text-white w-[40vw] bg-slate-300 mr-6">
  //       <h1>This is for {name}</h1>
  //       <p>Recording: {recording}</p>
  //       <p>Speaking: {speaking}</p>
  //       <p>Transcribing: {transcribing}</p>
  //       <p>Transcribed Text: {transcript.text}</p>
  //       <div className="flex flex-col gap-4 text-white">
  //         <button onClick={() => startRecording()}>Start</button>
  //         <button onClick={() => pauseRecording()}>Pause</button>
  //         <button onClick={() => stopRecording()}>Stop</button>
  //       </div>
  //     </div>
  //   );
  // };

  const [micStream, setMicStream] = useState(null);

  // Set up the whisper hooks for microphone and system audio
  const {
    recording: micRecording,
    speaking: micSpeaking,
    transcribing: micTranscribing,
    transcript: micTranscript,
    pauseRecording: pauseMicRecording,
    startRecording: startMicRecording,
    stopRecording: stopMicRecording,
  } = useWhisper({
    apiKey: "sk-",
    audioStream: micStream,
    streaming: true,
    timeSlice: 1_000, // 1 second
    whisperConfig: {
      language: "en",
    },
  });

  // Get the microphone stream
  useEffect(() => {
    const getMicStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMicStream(stream);
      } catch (err) {
        console.error("Error accessing microphone: ", err);
      }
    };
    getMicStream();
  }, []);

  // Start recording when streams are ready
  useEffect(() => {
    if (micStream) {
      startMicRecording();
    }
    return () => {
      stopMicRecording();
    };
  }, [micStream]);

  return (
    <div className="text-white w-[30vw]">
      <h1>Whisper Transcription</h1>
      <div className="flex flex-col gap-4">
        <h2>Microphone</h2>
        <button onClick={startMicRecording} disabled={micRecording}>
          Start Mic Recording
        </button>
        <button onClick={stopMicRecording} disabled={!micRecording}>
          Stop Mic Recording
        </button>
        <button onClick={pauseMicRecording} disabled={!micRecording}>
          Pause Mic Recording
        </button>
        {!!micTranscribing && <p>Transcribing microphone audio...</p>}
        {micTranscript && <p>Microphone Transcript: {micTranscript?.text}</p>}
      </div>
    </div>
  );
};
export default TestingReactWisper;
