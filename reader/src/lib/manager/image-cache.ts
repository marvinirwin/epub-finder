import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

const imageCache = new Map<string, HTMLImageElement>()
export const tapCacheScheduleRowImages = <T>(getImageSrcsFn: (v: T) => Promise<string[]>) => (o$: Observable<T>): Observable<T> =>
    o$.pipe(
        tap(pulledValue => getImageSrcsFn(pulledValue).then(imageSources => {
                imageSources.slice(0, 10)
                    .forEach(imageSrc => {
                        if (imageSrc && !imageCache.get(imageSrc)) {
                            const el = new Image()
                            el.src = imageSrc
                            imageCache.set(imageSrc, el)
                        }
                    })
            }),
        )
        ,
    )
