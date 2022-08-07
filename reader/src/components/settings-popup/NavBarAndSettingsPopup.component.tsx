import React, {useEffect, useState} from "react";
import {ParentLanguageOption, VariantLanguageOption} from "../menu-landing-page/menu-landing-page.component";
import {TreeMenuNode} from "../app-directory/tree-menu-node.interface";

export type NavBarAndSettingsProps = {
  languages: ParentLanguageOption[];
  navBarItems: TreeMenuNode[]
  language: ParentLanguageOption | undefined,
  setLanguage: (v: ParentLanguageOption) => unknown
  variant: VariantLanguageOption,
  setVariant: (v: VariantLanguageOption) => unknown
};

export const NavBarAndSettingsPopup: React.FC<NavBarAndSettingsProps> = (
  {
    languages,
    navBarItems,
    language,
    setLanguage,
    variant,
    setVariant
  }) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = languages.find((lang) => lang.value === event.target.value) as ParentLanguageOption;
    setLanguage(selectedLang);
  };

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (language?.variants) {
      const selectedVariant = language.variants.find((lang) => lang.value === event.target.value) as VariantLanguageOption;
      setVariant(selectedVariant);
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center relative w-full h-[70px] px-8">
        {showSettings ? (
          <>
            <div
              className="fixed top-0 left-0 w-screen h-screen z-10 bg-[rgba(0,0,0,0.5)]"
              onClick={() => setShowSettings(false)}
            />
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
                    {lang.label}
                  </option>
                ))}
              </select>
              {language?.variants?.length && (
                <select
                  className="w-[300px] h-11 p-2 font-sans text-base border rounded-sm border-[#d4d4d8] text-[#71717A]"
                  defaultValue={variant.value}
                  value={variant.value}
                  onChange={handleVariantChange}
                >
                  {language?.variants?.map((lang) => (
                    <option className="text-1rem text-[#71717A]" key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        ) : (
          <>
            {
              navBarItems.map(item => <span key={item.name}>{item.label}</span>)
            }
            <div
              className="mx-5 w-10 h-10 rounded-full bg-[#D9D9D9] flex justify-space-around items-center"
              onClick={() => setShowSettings(true)}
            >
              <span>M</span>
            </div>
          </>
        )}
      </nav>
    </>
  );
};
