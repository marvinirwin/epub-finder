import axios from "axios";

export const getImages = (term: string) => {
    return axios.post(`${process.env.PUBLIC_URL}/image-search`, {term})
}
