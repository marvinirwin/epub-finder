const Epub = require("epub-gen");

const option = {
    title: "Test Book", // *Required, title of the book.
    author: "Marvin Irwin", // *Required, name of the author.
    content: [
        {
            data: "<h2>人人人在能能是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是是</h2>"
        },
        {
            data: "<p>人人人人人在是是</p>"
        }
    ]
};

new Epub(option, "./test.epub");