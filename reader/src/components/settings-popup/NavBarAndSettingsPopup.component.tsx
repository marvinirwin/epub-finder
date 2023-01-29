import React, {useState} from "react";
import {ParentLanguageOption, VariantLanguageOption} from "../menu-landing-page/menu-landing-page.component";
import {TreeMenuNode} from "../app-directory/tree-menu-node.interface";
import {goToSignIn, signInUrl} from "../app-directory/nodes/sign-in-with.node";
import {NavBar} from "../NavBar.component";

export type NavBarAndSettingsProps = {
  languages: ParentLanguageOption[];
  navBarItems: TreeMenuNode[]
  language: ParentLanguageOption | undefined,
  setLanguage: (v: ParentLanguageOption) => unknown
  variant: VariantLanguageOption,
  setVariant: (v: VariantLanguageOption) => unknown
  currentUserEmail: string | undefined;
  selectedNavItem: TreeMenuNode
  isLoading: boolean
  loadingMessage: string
};

export const NavBarAndSettingsPopup: React.FC<NavBarAndSettingsProps> = (
  {
    languages,
    navBarItems,
    language,
    setLanguage,
    variant,
    setVariant,
    currentUserEmail,
    selectedNavItem,
    isLoading,
    loadingMessage
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
        <>
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
                  disabled={true}
                  placeholder={'email'}
                  onClick={() => {
                  }}
                  value={currentUserEmail}
                />
                {
                  !currentUserEmail ? <a
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full mx-8 my-1"
                    href={signInUrl}
                  >Login</a> : null
                }
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
                    defaultValue={variant?.value}
                    value={variant?.value}
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
              <NavBar
                navItems={navBarItems}
                selectedNavItem={selectedNavItem}
                userProfileButton={
                  <div
                    className="ml-5 w-10 h-10 rounded-full bg-[#D9D9D9] flex justify-center items-center"
                    onClick={() => {
                      setShowSettings(true);
                    }}
                  >
                    <span>{currentUserEmail ? currentUserEmail[0] : '?'}</span>
                  </div>
                }
              />
            </>
          )}
        </>
      </>
    );
  }
;
