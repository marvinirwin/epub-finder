import React from "react";
import {flatten} from "lodash";


export type VariantLanguageOption = { value: string, label: string };
export type ParentLanguageOption = { value: string, label: string, variants: VariantLanguageOption[] };

export type LandingPageProps = {
  languages: ParentLanguageOption[],
  language: ParentLanguageOption,
  setLanguage: (l: ParentLanguageOption) => unknown,
  variant: VariantLanguageOption | undefined,
  setVariant: (v: VariantLanguageOption) => unknown,
  dragActive: boolean,
  onDragEnter: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent) => void,
  onSubmit: (e: React.ChangeEvent<HTMLFormElement>) => void,
  ref: React.RefObject<HTMLInputElement>,
  onClick: () => void
};

export const LandingPage = (
  {
    dragActive,
    language,
    languages,
    onClick,
    onDragEnter,
    onDrop,
    onSubmit,
    ref,
    setLanguage,
    setVariant,
    variant
  }: LandingPageProps) => <div className="w-full h-full flex flex-row">
  <div className="flex flex-col w-1/2">
    <h1 className="text-6xl">Learn all the words</h1>
    <h1 className="text-6xl">from a restaurant menu</h1>
    <img src="https://i.kfs.io/album/global/160289973,0v1/fit/500x500.jpg" className="w-full"/>
  </div>
  <div className="flex flex-col w-1/2 p-5">
    <div className="flex flex-col justify-center items-center m-8">
      <select
        className="w-[300px] h-11 mb-[30px] text-1rem text-[#71717A]"
        defaultValue={languages[0].value}
        value={language?.value}
        onChange={v => setLanguage(languages.find(language => language.value === v.target.value) as ParentLanguageOption)}
      >
        {languages.map(language => <option value={language.value}>{language.label}</option>)}
      </select>
      {variant && (
        <select
          className="w-[300px] h-11 text-1rem text-[#71717A]"
          defaultValue={variant.value}
          value={variant.value}
          onChange={(e) => {
            const allVariants = flatten(languages.map(language => language.variants));
            setVariant(allVariants.find(variant => variant.value === e.target.value) as VariantLanguageOption);
          }}
        >
          {language?.variants?.map(variant => <option value={variant.value} className="text-1rem text-[#71717A]">
            {variant.label}
          </option>)}
        </select>
      )}
    </div>
    <form
      className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center flex-1 ${
        dragActive && "border-[#0F91D2] bg-slate-100"
      }`}
      onDragEnter={onDragEnter}
      onDragOver={onDragEnter}
      onDragLeave={onDragEnter}
      onDrop={onDrop}
      onSubmit={onSubmit}
    >
      <input ref={ref} className="hidden" type="file" id="input-file-upload" multiple={true}/>
      <label id="label-file-upload" htmlFor="file-upload" className={dragActive ? "drag-active" : ""}>
        <div className="flex flex-col justify-center items-center">
          <img className="w-12 h-12 mb-8" src={require("./upload-cloud.svg").default}/>
          <p className="mx-5 mb-3">Select a file or drag and drop here</p>
          <p className="mx-5 mb-5 text-gray-400">JPG, PNG, or PDF, file size no more than 10mb</p>
          <button
            className="px-3 py-2 text-sm text-[#0F91D2] rounded-lg border border-[#0f91d2]"
            onClick={onClick}
          >
            SELECT FILE
          </button>
        </div>
      </label>
    </form>
  </div>
</div>;

