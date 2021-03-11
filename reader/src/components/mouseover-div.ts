import {useEffect, useState} from "react";
import React from "react";

export const mouseFollowingDiv = document.createElement('div');
const titleContentDiv = document.createElement('div');
const subtitleContentDiv = document.createElement('div');
mouseFollowingDiv.appendChild(titleContentDiv);
mouseFollowingDiv.appendChild(subtitleContentDiv);
mouseFollowingDiv.id = 'mouseFollowingDiv';
mouseFollowingDiv.classList.add('MuiPaper-root', 'MuiPaper-elevation1','MuiPaper-rounded')
titleContentDiv.id = 'titleContentDiv';
subtitleContentDiv.id = 'subtitleContentDiv';
document.body.appendChild(mouseFollowingDiv);

export const setDivText = (div: HTMLDivElement, s: string) => {
    div.innerText = s;
    if (s) {
        div.classList.add('has-text')
    } else {
        div.classList.remove('has-text')
    }
}
export const setMouseOverText = (title: string, subtitle: string) => {
    setDivText(titleContentDiv, title);
    setDivText(subtitleContentDiv, subtitle);
}

export const setMouseOverDivPosition = (e: {clientX: number, clientY: number}) => {
    mouseFollowingDiv.style.left = `${e.clientX + 15}px`;
    mouseFollowingDiv.style.top = `${e.clientY}px`;
}

window.onmousemove = setMouseOverDivPosition


