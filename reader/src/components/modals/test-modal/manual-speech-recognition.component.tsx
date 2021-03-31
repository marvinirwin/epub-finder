import React, { useContext, useState } from "react";
import { ManagerContext } from "../../../App";
import { observableLastValue } from "../../../services/settings.service";

export const ManualSpeechRecognition = () => {
  const m = useContext(ManagerContext);
  const [
    speechRecInput,
    setSpeechRecInput,
  ] = useState<HTMLInputElement | null>();
  return (
    <div>
      <input id="manual-speech-recognition-input" ref={setSpeechRecInput} />
      <button
        id="submit-manual-speech-recognition"
        onClick={async () => {
          m.pronunciationProgressService.addRecords$.next([
            {
              word: speechRecInput?.value || "",
              success: true,
              timestamp: new Date(),
              languageCode: await observableLastValue(
                m.languageConfigsService.languageCode$
              ),
            },
          ]);
        }}
      >
        Submit manual speech recognition
      </button>
    </div>
  );
};
