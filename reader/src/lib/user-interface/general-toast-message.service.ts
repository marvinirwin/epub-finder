import { ToastMessage, ToastMessageService } from './toast-message.service'
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import React from 'react'

export type ToastMessageWithComponent = { Component: React.FC }

export class GeneralToastMessageService {
    addToastMessage$ = new Subject<React.FC>()
    toastMessageService: ToastMessageService<ToastMessageWithComponent>
    constructor() {
        this.toastMessageService = new ToastMessageService<ToastMessageWithComponent>(
            {
                addToastMessage$: this.addToastMessage$.pipe(
                    map(
                        (Component) =>
                            new ToastMessage<ToastMessageWithComponent>(10000, {
                                Component,
                            }),
                    ),
                ),
            },
        )
    }
}
