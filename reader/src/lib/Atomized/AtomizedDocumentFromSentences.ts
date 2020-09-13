export function interpolateSourceDoc(sentences: string[]) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Example Sentences</title>
</head>
<body>
<div class="popper-container">
${sentences.map(sentence => {
        return `<div>${sentence}</div>`;
    }).join('</br>')}
</div>
</body>
</html>
        `;
}