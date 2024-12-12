import "../src/index.css"
import React, { useState } from "react";
import { StepSequencer } from "./components/StepSequencer"; 

const N_STEPS = 16;
const steps = Array.from({ length: N_STEPS }, (_, index) => ({
    pitch: index % 12,
    velocity: 100,
    duration: 100,
}));

export const App = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [log, setLog] = React.useState<string[]>([]);


    return  <div className="flex flex-col items-center">
        <h1 className="text-center">Arp++</h1>
        <span className="text-center">
            <PlayStopButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </span>
        <span className="text-center mt-3"></span>
        <StepSequencer  setLog={setLog} />

        <ul>
            <h1>Logs</h1>
            {log.map((message, index) => (
                <li key={index}>{JSON.stringify(message)}</li>
            ))}
        </ul>
    </div>
    }



const PlayStopButton = ({ isPlaying,setIsPlaying }) => {
    
    const handlePlayStop = () => {
        // @ts-ignore
        __postNativeMessage__("toogleplay").then((response) => {
            const parsed = JSON.parse(response);
            setIsPlaying(parsed.isPlaying);
        });
    };
    
    return (
        <button onClick={handlePlayStop} className="border-2 border-black w-8 h-8">
            {isPlaying ? "Stop" : "Play"}
        </button>
    );
}
