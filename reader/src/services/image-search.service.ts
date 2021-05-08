import axios from 'axios'
import { ImageObject } from '@server/'
import { ImageSearchRequest } from '@shared/*'

export type ImageSearchResult = ImageObject[];
export const getImages = (term: string): Promise<ImageSearchResult> => {
    return axios
        .post(`${process.env.PUBLIC_URL}/image-search`, { term })
        .then((response) => response?.data || [])
}
