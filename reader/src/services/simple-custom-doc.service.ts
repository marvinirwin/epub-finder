export function interpolateSimpleCustomDoc(text: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title/>
</head>
<body>
<!--is this popper-container necessary?-->
<article class="popper-container">
${text}
</article>
</body>
</html>`;
}