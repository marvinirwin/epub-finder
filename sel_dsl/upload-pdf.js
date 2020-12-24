const runExpression = require('./index');
runExpression(
    `
    (
    (sendKeys #file-chooser "/home/root/test-pdf.pdf")
    
    (sendKeys #file-chooser "/home/root/test-pdf.pdf")
    )
    `
)