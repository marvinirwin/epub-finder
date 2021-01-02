import axios from "axios";
import {ImageObject} from "@server/";

export const getImages = (term: string): Promise<ImageObject[]> => {
    return axios.post(`${process.env.PUBLIC_URL}/image-search`, {term}).then(response => response?.data || [])
}
