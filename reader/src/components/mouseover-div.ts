import {useEffect, useState} from "react";
import React from "react";

export const mouseFollowingDiv = document.createElement('div');
mouseFollowingDiv.id = 'mouseFollowingDiv';
mouseFollowingDiv.classList.add('MuiPaper-root', 'MuiPaper-elevation1','MuiPaper-rounded')
document.body.appendChild(mouseFollowingDiv);

export const setMouseOverText = (s: string) => {
    mouseFollowingDiv.innerText = s;
    if (s) {
        mouseFollowingDiv.classList.add('has-text')
    } else {
        mouseFollowingDiv.classList.remove('has-text')
    }
}

export const setMouseOverDivPosition = (e: {clientX: number, clientY: number}) => {
    mouseFollowingDiv.style.left = `${e.clientX + 15}px`;
    mouseFollowingDiv.style.top = `${e.clientY}px`;
}

window.onmousemove = setMouseOverDivPosition


