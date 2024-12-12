import React, { useCallback, useEffect } from "react";
import { Step } from "../structures";
import { StepButton } from "./StepButton";

type StepSequencerProps = {
  setLog: React.Dispatch<React.SetStateAction<string[]>>;
};

export const StepSequencer = ({ setLog }: StepSequencerProps) => {
  const [steps, setSteps] = React.useState<Step[]>([]);

  const sync = useCallback(() => {
    // @ts-ignore
    __postNativeMessage__("sync").then((response) => {
      setLog([response]);
      const parsed = JSON.parse(response);
      setSteps(parsed.steps);
    });
  }, []);

  const handleCycleIncrease = (index) => {
    // @ts-ignore
    __postNativeMessage__(`cycle ${index} +1`).then((response) => {
      setLog([response]);
      const parsed = JSON.parse(response);
      setSteps(parsed.steps);
    });
  };

  useEffect(() => {
    sync();
  },[]);

  return (
    <div className="flex flex-row justify-center">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col">
          <Slice
            index={index}
            setLog={setLog}
            setSteps={setSteps}
            pitches={steps[index].pitches}
          />
          <button
            onClick={() => handleCycleIncrease(index)}
            className="border-2 border-black w-8 h-4 mt-1"
          >+
          </button>
          <button className="border-2 border-black w-8 h-4 mt-1">
            -
          </button>
        </div>
      ))}
      <button onClick={() => sync()}>Sync</button>
      length: {steps.length}
    </div>
  );
};

const Slice = React.memo(
  ({
    index,
    setLog,
    setSteps,
    pitches,
  }: {
    index: number;
    setLog: Function;
    setSteps: Function;
    pitches: number[];
  }) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleClick = () => {
      // @ts-ignore
      const r = __postNativeMessage__(`click ${index}`).then((response) => {
        setLog([]);
        const parsed = JSON.parse(response);
        setLog((prev: string[]) => [...prev, parsed.steps]);
        setSteps(parsed.steps);
      });
    };

    return (
      <div className="flex flex-col">
        {pitches.map((pitch, index) => (
          <StepButton key={index} ref={buttonRef} onClick={handleClick}>
            {pitch}
          </StepButton>
        ))}
      </div>
    );
  }
);
