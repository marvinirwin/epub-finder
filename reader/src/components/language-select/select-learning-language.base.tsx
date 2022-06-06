import React from "react";

export type SelectLearningLanguageBaseProps = { onChange: ((languageCode: string) => unknown), options: { label: string, code: string }[], value: string };
/**
 * A "Base" component is one which does not use observables or context, it just receives normal arguments and fires onSomething events
 * It would be sick to have all components have a base version and a version which plugs into observables, for testing and storybook purposes
 * @constructor
 */
export const SelectLearningLanguageBase: React.FC<SelectLearningLanguageBaseProps> = ({ onChange, options, value }) => {
  return <select
    id="#speech-practice-learning-language"
    value={value}
    onChange={(ev) => {
      onChange(ev.target.value as string);
    }}
    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
  >
    {options.map((language) => (
      <option value={language.code} key={language.code}>
        {language.label}
      </option>
    ))}
  </select>;
};