import React, {useContext, useState} from "react";
import {TESTING} from "../app-directory-service";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";

export function TestingUtilsNode(m: Manager): TreeMenuNode {
    return {
        name: 'manual-speech-recognition',
        hidden: !TESTING,
        label: '[TESTING UTILS]',
        action: () => m.modalService.testingUtils.open$.next(true)
    }
}
