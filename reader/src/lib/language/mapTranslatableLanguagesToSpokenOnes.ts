import {TextSpeechMap} from "./text-speech-map";
import {SpeechToTextConfig, SupportedSpeechToTextService} from "@shared/";

export const mapTranslatableLanguagesToSpokenOnes = (readingLanguageCode: string) => {
  const lowerCode = readingLanguageCode.toLowerCase();
  const textSpeechMapElement = TextSpeechMap[lowerCode];
  return (textSpeechMapElement || []).map((code) =>
    SupportedSpeechToTextService.ConfigMap.get(code)
  ).filter(v => !!v) as SpeechToTextConfig[];
};