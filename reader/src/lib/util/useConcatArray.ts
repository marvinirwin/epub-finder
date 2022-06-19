import { useMemo } from "react";
import { flatten } from "lodash";

export function useConcatArray<A extends any[][]>(...a: A) {
  return useMemo(() => flatten(a), a);
}