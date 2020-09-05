export const BodyStyle = `
    .popper-container {
        /* Required to make the positioning of popper-elements nice */
        position: relative;
        z-index: 2;
    }
    body {
        padding-top: 100px;
        font-size: 150%;
    }
    mark {
        position: relative; /*  Required to keep our pseudo elements in check*/
        background: transparent;
    }
    mark:hover {
        cursor: pointer;
    }
    mark.highlighted::after {
        opacity: 1;
    }
    mark::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: #a0a0a0;
        opacity: 0;
        transition: opacity 250ms;
        z-index: -1;
    }
    
    .highlighted::after {
        opacity: 1;
    }


    .annotated_and_translated {
        position: relative;
        
    }
    .annotated_and_translated:hover::after,
    .annotated_and_translated.highlighted-sentence::after {
            opacity: 0.15;
        }
    .annotated_and_translated::after {
        content: "";
        position: absolute;
        z-index: -1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: #a0a0a0;
        opacity: 0;
        transition: opacity 250ms;
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