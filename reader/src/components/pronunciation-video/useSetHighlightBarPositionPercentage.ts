import {useDebouncedFn} from "beautiful-react-hooks";
import {ManagerContext} from "../../App";
import {useContext, useEffect} from "react";

export const useHighlightBarPositionPercentage = (startPercentage: number, endPercentage: number) => {
     const m = useContext(ManagerContext);
     const setHighlightBarPositionPercentages = useDebouncedFn(() => {
          m.settingsService.playbackStartPercent$.next(startPercentage);
          m.settingsService.playbackEndPercent$.next(endPercentage);
     });

     useEffect(() => {
          setHighlightBarPositionPercentages.cancel();
     }, []);

    useEffect(() => {
         setHighlightBarPositionPercentages();
    }, [startPercentage, endPercentage, setHighlightBarPositionPercentages]);
}