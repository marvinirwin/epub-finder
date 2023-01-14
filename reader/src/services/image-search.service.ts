import axios from 'axios'
import { ImageObject } from '@shared/'
import { getApiUrl } from '../lib/util/getApiUrl';

export type ImageSearchResult = ImageObject[];
export const getImages = (term: string): Promise<ImageSearchResult> => {
    return axios
        .post(getApiUrl("/api/image-search"), { term })
        .then((response) => response?.data || [])
}
