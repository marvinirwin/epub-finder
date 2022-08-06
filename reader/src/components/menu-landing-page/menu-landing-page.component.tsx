import React, { useState, useEffect, useRef, DragEvent } from "react";
import { SettingsPopup } from "../settings-popup/settings-popup.component";

export type Language = {
  value: string;
  name: string;
  variants?: Language[];
};

export type MenuLandingPageProps = {
  languages: Language[];
  onLanguageSelect: (lang: Language | undefined) => void;
  onVariantSelect: (lang: Language | undefined) => void;
  onFileUpload: (files: any) => void;
};

export const MenuLandingPage: React.FC<MenuLandingPageProps> = ({
  languages,
  onLanguageSelect,
  onVariantSelect,
  onFileUpload,
}) => {
  const [language, setLanguage] = useState<Language | undefined>(undefined);
  const [variant, setVariant] = useState<Language | undefined>(undefined);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (languages.length) {
      const lang = languages[0];
      setLanguage(lang);
      if (lang.variants?.length) {
        setVariant(lang.variants[0]);
      }
    }
  }, [languages]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = languages.find((lang) => lang.value === e.target.value);
    setLanguage(selectedLang);
    onLanguageSelect(selectedLang);
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (language?.variants) {
      const selectedVariant = language.variants.find((lang) => lang.value === e.target.value);
      setVariant(selectedVariant);
      onVariantSelect(selectedVariant);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const uploadedFiles = e.dataTransfer.files;
    if (uploadedFiles.length) {
      onFileUpload(uploadedFiles);
    }
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {};

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full h-full relative">
      <SettingsPopup
        languages={languages}
        onLanguageSelect={handleLanguageChange}
        onVariantSelect={handleVariantChange}
      />
      <div className="w-full h-full flex flex-row">
        <div className="flex flex-col w-1/2">
          <h1 className="text-6xl">Learn all the words</h1>
          <h1 className="text-6xl">from a restaurant menu</h1>
          <img src="https://i.kfs.io/album/global/160289973,0v1/fit/500x500.jpg" className="w-full" />
        </div>
        <div className="flex flex-col w-1/2 p-5">
          <div className="flex flex-col justify-center items-center m-8">
            <select
              className="w-[300px] h-11 mb-[30px] text-1rem text-[#71717A]"
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
                className="w-[300px] h-11 text-1rem text-[#71717A]"
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
          <form
            className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center flex-1 ${
              dragActive && "border-[#0F91D2] bg-slate-100"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={handleSubmit}
          >
            <input ref={inputRef} className="hidden" type="file" id="input-file-upload" multiple={true} />
            <label id="label-file-upload" htmlFor="file-upload" className={dragActive ? "drag-active" : ""}>
              <div className="flex flex-col justify-center items-center">
                <img className="w-12 h-12 mb-8" src={require("./upload-cloud.svg").default} />
                <p className="mx-5 mb-3">Select a file or drag and drop here</p>
                <p className="mx-5 mb-5 text-gray-400">JPG, PNG, or PDF, file size no more than 10mb</p>
                <button
                  className="px-3 py-2 text-sm text-[#0F91D2] rounded-lg border border-[#0f91d2]"
                  onClick={handleUploadClick}
                >
                  SELECT FILE
                </button>
              </div>
            </label>
          </form>
        </div>
      </div>
    </div>
  );
};
