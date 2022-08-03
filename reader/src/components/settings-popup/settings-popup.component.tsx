import React, { useState, useEffect } from "react";
import { Language } from "../menu-landing-page/menu-landing-page.component";

export type SettingsPopupProps = {
  show: boolean;
  languages: Language[];
  onLanguageSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onVariantSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SettingsPopup: React.FC<SettingsPopupProps> = ({ show, languages, onLanguageSelect, onVariantSelect }) => {
  const [language, setLanguage] = useState<Language | undefined>(undefined);
  const [variant, setVariant] = useState<Language | undefined>(undefined);

  useEffect(() => {
    if (languages.length) {
      const lang = languages[0];
      setLanguage(lang);
      if (lang.variants?.length) {
        setVariant(lang.variants[0]);
      }
    }
  }, [languages]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = languages.find((lang) => lang.value === event.target.value);
    setLanguage(selectedLang);
    onLanguageSelect(event);
  };

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (language?.variants) {
      const selectedVariant = language.variants.find((lang) => lang.value === event.target.value);
      setVariant(selectedVariant);
      onVariantSelect(event);
    }
  };

  return (
    <>
      {show ? (
        <div className="absolute top-1 right-1 z-20 p-3 w-80 h-[570px] flex flex-col items-center bg-white">
          <input
            className="w-[300px] h-11 p-2 mb-3 font-sans text-base border rounded-sm border-[#d4d4d8] text-[#71717A]"
            type="email"
          />
          <select
            className="w-[300px] h-11 p-2 mb-3 font-sans text-base border rounded-sm border-[#d4d4d8] text-[#71717A]"
            defaultValue={languages[0].value}
            value={language?.value}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option className="text-1rem text-[#71717A]" key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>
          {variant && (
            <select
              className="w-[300px] h-11 p-2 font-sans text-base border rounded-sm border-[#d4d4d8] text-[#71717A]"
              defaultValue={variant.value}
              value={variant.value}
              onChange={handleVariantChange}
            >
              {language?.variants?.map((lang) => (
                <option className="text-1rem text-[#71717A]" key={lang.value} value={lang.value}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

SettingsPopup.defaultProps = {
  show: true,
  languages: [
    {
      value: "zh",
      name: "Chinese",
      variants: [
        {
          value: "zh-Hans",
          name: "Chinese (Simplified)",
        },
        {
          value: "zh-Hant",
          name: "Chinese (Traditional)",
        },
      ],
    },
    {
      value: "en",
      name: "English",
      variants: [
        {
          value: "en-CA",
          name: "English (CA)",
        },
        {
          value: "en-US",
          name: "English (US)",
        },
      ],
    },
  ],
  onLanguageSelect: () => {},
  onVariantSelect: () => {},
};
