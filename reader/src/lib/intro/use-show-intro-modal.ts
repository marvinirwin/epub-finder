import { useContext } from "react";
import { ManagerContext } from "../../App";
import { SHOW_INTRO } from "../util/url-params";

export const useShowIntroModal = () => {
  const m = useContext(ManagerContext);
  if (!localStorage.getItem("firstTime") || SHOW_INTRO) {
    m.modalService.intro.open$.next(true);
  }
};
