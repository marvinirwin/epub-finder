import React, { useState, useEffect } from "react";
import { QuizProgressBar } from "../../quiz-progress-bar.component";
const playButton: string = require("./play-button.svg").default;
const pauseButton: string = require("./pause-button.svg").default;

export type CardData = {
  romanization: string;
  knownLanguage: string;
  dictionaryDefinition: string;
  sound: string;
};

export type RevealedQuizCardProps = {
  progressBarPercentage: number;
  exampleSentences: string[];
  cardInfo: CardData;
};

// https://cdn.pixabay.com/photo/2015/05/18/23/19/gesture-772977_960_720.jpg

export const RevealedQuizCard: React.FC<RevealedQuizCardProps> = ({
  progressBarPercentage,
  exampleSentences,
  cardInfo,
}) => {
  const { romanization, knownLanguage, dictionaryDefinition, sound } = cardInfo;

  const [audio] = useState(new Audio(sound));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, []);

  const handlePlayClick = () => {
    setPlaying(!playing);
  };

  return (
    <div className="w-full h-full relative bg-white">
      <QuizProgressBar progressBarPercentage={progressBarPercentage} />
      <div className="w-full flex flex-row flex-wrap">
        <div className="w-1/3 md:w-full">
          <img className="rounded-md" src="https://cdn.pixabay.com/photo/2015/05/18/23/19/gesture-772977_960_720.jpg" />
        </div>
        <div className="w-1/3 flex flex-row flex-wrap p-3 leading-none">
          {exampleSentences.map((sentence: string, idx: number) => (
            <p key={idx}>{`"${sentence}${idx !== exampleSentences.length - 1 ? "," : ""}"`}</p>
          ))}
        </div>
        <div className="w-1/3 p-3">
          <div>
            <div className="mb-3 leading-none">
              <p className="text-[#6B7280]">{"$romanizationTitle"}</p>
              <p>{romanization}</p>
            </div>
            <div className="mb-3 leading-none">
              <p className="text-[#6B7280]">{"$knownLanguageTitle"}</p>
              <p>{knownLanguage}</p>
            </div>
            <div className="mb-2 leading-none">
              <p className="text-[#6B7280]">{"$dictionaryDefinitionTitle"}</p>
              <p>{dictionaryDefinition}</p>
            </div>
          </div>
          <button className="my-4" onClick={handlePlayClick}>
            <img className="w-6 h-6" src={playing ? pauseButton : playButton} />
          </button>
          <div className=" my-6 flex flex-row w-full justify-between items-center">
            <div className="w-20 h-10 bg-[#064E3B] text-white flex justify-evenly items-center">
              <p>Easy</p>
            </div>
            <div className="w-20 h-10 bg-[#78350F] text-white flex justify-evenly items-center">
              <p>Medium</p>
            </div>
            <div className="w-20 h-10 bg-[#7F1D1D] text-white flex justify-evenly items-center">
              <p>Hard</p>
            </div>
            <div className="w-20 h-10 bg-[#1E3A8A] text-white flex justify-evenly items-center">
              <p>Known</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
