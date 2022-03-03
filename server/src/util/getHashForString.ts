import {createHash} from "sha1-uint8array";

export const getHashForString = (str: string) =>  createHash().update(str).digest("hex");