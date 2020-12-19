import {flatten} from 'lodash';

export class InterpolateService {
    static html(head: string, body: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    ${head}
</head>
<body>
<div>
${body}
</div>
</body>
</html>
        `;
    }

    static text(body: string): string {
        return InterpolateService.html(
            '',
            InterpolateService.splitByMultipleKeepDelim(['。', '\n'], body)
                .map(sentence => sentence.trim())
                .filter(sentence => !!sentence)
                .map(sentence => `<div>${sentence}</div>`)
                .join('\n')
        )
    }

    static sentences(sentences: string[]): string {
        return InterpolateService.html(
            '',
            `
${sentences.map(sentence => {
                return `<div>${sentence}</div>`;
            }).join('</br>')}
            `
        )
    }

    static splitByMultipleKeepDelim (separators: string[], text: string): string[] {
        let arr: string[] = [text];
        separators.forEach(separator => {
            arr = flatten(arr.map(sentence => sentence.split(separator)
                .filter(splitResult => !!splitResult.trim())
                .map(sentence => `${sentence}${separator}`)
            ));
        })
        return arr;
    }
}