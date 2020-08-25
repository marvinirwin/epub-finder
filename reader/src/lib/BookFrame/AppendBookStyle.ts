export const appendBookStyle = (d: Document) => {
    const innerText = `
        body {
        padding-top: 100px;
        font-size: 150%;
    }
    mark {
        position: relative;
        background: transparent;
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

    mark:hover {
        cursor: pointer;
    }

.annotated_and_translated {
        position: relative;
    }
.annotated_and_translated:hover::after,
.annotated_and_translated.highlighted-sentence{
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
        height: fit-content;
        z-index: 9999;
        display: none;

    }

    .POPPER_ELEMENT[data-show] {
            display: block;
        }
        
    }`;

    const el = d.createElement('style');
    el.innerText = innerText;
    d.body.appendChild(el);
}