export const BodyStyle = `
    .popper-container {
        /* Required to make the positioning of popper-elements nice */
        position: relative;
        z-index: 2;
        max-width: 680px;
    }
    body {
        font-size: 150%;
    }
    @media only screen and (min-width: 903.99px) {
        body > div {
            margin: 0 48px;
        }
    }
    @media only screen and (max-width: 903.98px) and (min-width: 728px) {
        body > div {
            margin: 0 48px;
        }
    }
    @media only screen and (max-width: 727px) {
        body > div {
            margin: 0 24px;
        }
    }

    mark {
        position: relative; /*  Required to keep our pseudo elements in check*/
        background-color: transparent;
        transition: background-color .25s ease-in-out;
    }
    mark:hover {
        cursor: pointer;
    }
    .annotated_and_translated {
        position: relative;
        transition: background-color .25s ease-in-out;
    }
    .POPPER_ELEMENT {
        background-color: #333;
        color: white;
        padding: 15px 15px;
        border-radius: 4px;
        font-size: 13px;
        display: none;
        z-index: 2;
    }

    .POPPER_ELEMENT[data-show] {
            display: block;
    }

    .has-metadata {
        background-color: lightgreen;
    }

    .no-metadata {
        background-color: pink;
    }
`;

