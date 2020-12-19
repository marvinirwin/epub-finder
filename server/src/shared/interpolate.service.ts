import {flatten} from "@nestjs/common";

export class InterpolateService {
    public static html(head: string, body: string): string {
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

    public static text(body: string): string {
        return InterpolateService.html(
            '',
            InterpolateService.splitByMultipleKeepDelim(['。', '\n'], body)
                .map(sentence => sentence.trim())
                .filter(sentence => !!sentence)
                .map(sentence => `<div>${sentence}</div>`)
                .join('\n')
        )
    }

    public static sentences(sentences: string[]): string {
        return InterpolateService.html(
            '',
            `
${sentences.map(sentence => {
                return `<div>${sentence}</div>`;
            }).join('</br>')}
            `
        )
    }

    private static splitByMultipleKeepDelim (separators: string[], text: string): string[] {
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