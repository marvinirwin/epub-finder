import {useEffect, useState} from "react";
import React from "react";

export const mouseFollowingDiv = document.createElement('div');
mouseFollowingDiv.id = 'mouseFollowingDiv';
mouseFollowingDiv.classList.add('MuiPaper-root', 'MuiPaper-elevation1','MuiPaper-rounded')
document.body.appendChild(mouseFollowingDiv);

export const setMouseOverText = (s: string) => {
    mouseFollowingDiv.innerText = s;
}

// @ts-ignore
window.onmousemove = (e) => {
    mouseFollowingDiv.style.left = `${e.clientX}px`;
    mouseFollowingDiv.style.top = `${e.clientY}px`;
}


