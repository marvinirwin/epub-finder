import {Observable} from 'rxjs'
import {map, shareReplay} from 'rxjs/operators'
import {SelectedVirtualTabulationsService} from '../manager/selected-virtual-tabulations.service'
import {SerializedTabulationAggregate} from "languagetrainer-server/src/shared"
import {pipeLog} from '../manager/pipe.log'
import {SegmentSubsequences, SerializedDocumentTabulation} from "languagetrainer-server/src/shared";

export class ExampleSegmentsService {
    exampleSegmentMap$: Observable<Map<string, SegmentSubsequences[]>>

     exampleSegmentTabulationMap$: Observable<Map<string, SerializedDocumentTabulation[]>>;

    constructor({
                    selectedVirtualTabulationsService,
                }: {
        selectedVirtualTabulationsService: SelectedVirtualTabulationsService
    }) {
        this.exampleSegmentMap$ = selectedVirtualTabulationsService.selectedExampleVirtualTabulations$.pipe(
            map((tabulation) => {
                return new SerializedTabulationAggregate(
                    tabulation,
                ).wordSegmentPositionedWordMap()
            }),
            pipeLog('example-segments:exampleSegmentMap'),
            shareReplay(1),
        );
        this.exampleSegmentTabulationMap$ = selectedVirtualTabulationsService.selectedExampleVirtualTabulations$.pipe(
            map((tabulation) => {
                return new SerializedTabulationAggregate(
                    tabulation,
                ).segmentTabulationMap()
            }),
            pipeLog('example-segments:exampleSegmentTabulationMap'),
            shareReplay(1),
        )
    }
}
