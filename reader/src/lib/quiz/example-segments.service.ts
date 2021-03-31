import { Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { SelectedVirtualTabulationsService } from '../manager/selected-virtual-tabulations.service'
import { SerializedTabulationAggregate } from '../../../../server/src/shared/tabulation/serialized-tabulation.aggregate'

export class ExampleSegmentsService {
    exampleSegmentMap$: Observable<Map<string, Set<string>>>

    // We take the words we know and then find the segments which contain the words we know
    constructor({
        selectedVirtualTabulationsService,
    }: {
        selectedVirtualTabulationsService: SelectedVirtualTabulationsService
    }) {
        this.exampleSegmentMap$ = selectedVirtualTabulationsService.selectedExampleVirtualTabulations$.pipe(
            map((tabulation) => {
                return new SerializedTabulationAggregate(
                    tabulation,
                ).wordSegmentStringsMap()
            }),
            shareReplay(1),
        )
    }
}
