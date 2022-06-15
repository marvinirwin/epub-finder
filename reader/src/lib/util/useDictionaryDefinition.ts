import { useContext } from "react";
import { ManagerContext } from "../../App";
import { useLoadingObservable } from "./create-loading-observable";
import usePromise from "react-use-promise";
import { LtDictionary } from "../dictionary/dictionary.service";
import { useObservable } from "observable-hooks";
import { map } from "rxjs/operators";
import { useConcatArray } from "./useConcatArray";
import { useVisibleObservableState } from "../../components/UseVisilbleObservableState/UseVisibleObservableState";

export const useDictionaryDefinition = (word: string) => {
  const m = useContext(ManagerContext);
  const dictionary = useLoadingObservable(m.dictionaryService.dictionary);
  const [definition] = usePromise(async () => {
    if (dictionary?.value && word) {
      return dictionary.value.getDefinition(word);
    }
  }, [word, dictionary]);

  const emittedDictionaries = useVisibleObservableState<LtDictionary>(m.dictionaryService.dictionary.obs$, d => `m.dictionaryService.dictionary.obs$ ${d.name}`);
  const definitions$ = useObservable(def$ => def$.pipe(map(([d]) => d)), [definition]);
  const emittedDefinitions = useVisibleObservableState<string | undefined>(definitions$)


  return {definition, emittedValues: useConcatArray(emittedDictionaries, emittedDefinitions)};
};