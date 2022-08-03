import React, { useState } from "react";
import { SettingsPopup, SettingsPopupProps } from "./settings-popup.component";

export default {
  title: "SettingsPopup",
  component: SettingsPopup,
};

const Template = (args: SettingsPopupProps) => {
  const [showSettings, setShowSettings] = useState(true);
  return (
    <div className="w-[900px] h-[700px] relative">
      {showSettings ? (
        <div className="w-full h-full relative">
          <div
            className="absolute top-0 left-0 w-full h-full z-10 bg-[rgba(0,0,0,0.5)]"
            onClick={() => setShowSettings(false)}
          />
          <SettingsPopup {...args} />
        </div>
      ) : (
        <button className="border rounded-sm border-black p-3" onClick={() => setShowSettings(true)}>
          Show Settings
        </button>
      )}
    </div>
  );
};

export const Default = Template.bind({});
