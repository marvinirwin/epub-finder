import {ReplaySubject} from "rxjs";
import React from "react";

export class NavModal {
    open$ = new ReplaySubject<boolean>(1);

    constructor(
        public id: string,
        public CardContents: React.FC<any>
    ) {
    }
}