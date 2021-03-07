import {useEffect, useState} from "react";
import React from "react";

export const mouseFollowingDiv = document.createElement('div');
const textContentDiv = document.createElement('div');
mouseFollowingDiv.appendChild(textContentDiv);
mouseFollowingDiv.id = 'mouseFollowingDiv';
mouseFollowingDiv.classList.add('MuiPaper-root', 'MuiPaper-elevation1','MuiPaper-rounded')
document.body.appendChild(mouseFollowingDiv);

export const setMouseOverText = (s: string) => {
    textContentDiv.innerText = s;
    if (s) {
        textContentDiv.classList.add('has-text')
    } else {
        textContentDiv.classList.remove('has-text')
    }
}

export const setMouseOverDivPosition = (e: {clientX: number, clientY: number}) => {
    mouseFollowingDiv.style.left = `${e.clientX + 15}px`;
    mouseFollowingDiv.style.top = `${e.clientY}px`;
}

window.onmousemove = setMouseOverDivPosition


