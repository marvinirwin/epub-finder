import {InterpolateService} from "@shared/";

export class InterpolateExampleSentencesService {
    public static interpolate(sentences: string[]) {
        return InterpolateService.html(
            `
<style>
.example-sentence-container {
    display: flex; 
    flex-flow: row wrap;
    justify-content: space-around;
}
.example-sentence {
    margin: 24px;
    flex: 1 0 20%;
}
</style>
            `,
            `
            
<div class="example-sentence-container">
${sentences .map(sentence => `<div class="example-sentence">${sentence}</div>` ).join('</br>')}
</div>
            `
        )
    }
}