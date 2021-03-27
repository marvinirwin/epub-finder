import React, {useContext, useState} from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/manager/Manager";
import {TESTING_UTILS} from "@shared/";
import {TESTING} from "../../../lib/util/url-params";


export function TestingUtilsNode(m: Manager): TreeMenuNode {
    return {
        name: TESTING_UTILS,
        hidden: !TESTING,
        label: '[TESTING UTILS]',
        action: () => m.modalService.testingUtils.open$.next(true)
    }
}
