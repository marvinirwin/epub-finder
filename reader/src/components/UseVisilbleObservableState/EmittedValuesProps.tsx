import { EmittedValue } from "./UseVisibleObservableState";

export type EmittedValuesProps = {
  emittedValues: EmittedValue<any>[],
  style?: Record<string, any> ,
  key: string
};