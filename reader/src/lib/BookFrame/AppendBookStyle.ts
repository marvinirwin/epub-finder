export const BodyStyle = `
    .popper-container {
        /* Required to make the positioning of popper-elements nice */
        position: relative;
        z-index: 2;
    }
    body {
        font-size: 150%;
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
    }
`;

export const appendBookStyle = (d: Document) => {

    const el = d.createElement('style');
    el.innerText = BodyStyle;
    d.body.appendChild(el);
}