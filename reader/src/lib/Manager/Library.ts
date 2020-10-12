import {Observable, ReplaySubject, Subject} from "rxjs";
import {DeltaScanner, ds_Dict, NamedDeltaScanner} from "../Util/DeltaScanner";
import {CustomDocument, Website} from "../Website/Website";
import {MyAppDatabase} from "../Storage/AppDB";
import {websiteFromFilename} from "../../AppSingleton";
import {withLatestFrom} from "rxjs/operators";

export class EditingBook {
    text$ = new ReplaySubject<string>(1);
    name$ = new ReplaySubject<string>(1);
    saveSignal$ = new Subject<void>();
}

interface LibraryParams {
    db: MyAppDatabase
}

export class Library {
    builtInBooks$ = new NamedDeltaScanner<Website>();
    customBooks$ = new NamedDeltaScanner<CustomDocument>();

    rawBook$ = new EditingBook();
    simpleBook$ = new EditingBook();
    db: MyAppDatabase;

    constructor({db}: LibraryParams) {
        this.db = db;

        function saveEvent(rawBook$2: EditingBook) {
            return rawBook$2.saveSignal$.pipe(
                withLatestFrom(
                    rawBook$2.name$,
                    rawBook$2.text$,
                )
            );
        }

        saveEvent(this.rawBook$).subscribe(async ([_, name, text]) => {
            // Put into the database, and then put it into the tree
            await this.db.customDocuments.put({
                name,
                html: text
            });
            this.appendCustomDocuments([new CustomDocument(name, text)])
        });

        saveEvent(this.simpleBook$).subscribe(async ([_, name, text]) => {
            // Put into the database, and then put it into the tree
            let html = interpolateSimpleCustomDoc(text);
            await this.db.customDocuments.put({
                name,
                html
            });
            this.appendCustomDocuments([new CustomDocument(name, html)])
        });

        this.loadDocuments();
    }

    async loadDocuments() {
        const customDocuments = await this.db.customDocuments.offset(0).toArray();
        this.appendCustomDocuments(customDocuments);

        const builtInDocuments = [
            "4_modernizations.html",
            "butter_pancake.html",
            "generals.html",
            "guardian_angel.html",
            "mango.html",
            'party_1.html',
            'smes.html',
            'song_1.html',
            'stories.html',
            'story_2.html',
            'story_living_room.html',
            'why_i_left_china.html',
            'zhou_enlai.html'
        ].map(websiteFromFilename);
        this.appendBuiltInDocuments(builtInDocuments);
    }

    appendBuiltInDocuments(builtInDocuments: Website[]) {
        this.builtInBooks$.appendDelta$.next({
            nodeLabel: 'root',
            children: Object.fromEntries(
                builtInDocuments.map(website => [
                    website.name,
                    {
                        value: website,
                        nodeLabel: website.name
                    }
                ])
            )
        })
    }

    appendCustomDocuments(customDocuments: Array<CustomDocument>) {
        this.customBooks$.appendDelta$.next({
            nodeLabel: "root",
            children: Object.fromEntries(
                customDocuments.map(customDocument => [
                    customDocument.name,
                    {
                        value: customDocument,
                        nodeLabel: customDocument.name
                    }
                ])
            )
        });
    }

    async putCustomDocument(name: string, html: string) {
        const customDocument = new CustomDocument(name, html);
        this.customBooks$.appendDelta$.next({
            nodeLabel: "root",
            children: {
                [name]: {
                    nodeLabel: name,
                    value: customDocument
                }
            }
        })
        const setting$ = await this.db.openBooks$;
        // Automatically add an open book once a custom document is added
        setting$.next({...setting$.getValue(), [name]: true});
    }
}

export function interpolateSimpleCustomDoc(text: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title/>
</head>
<body>
<!--is this popper-container necessary?-->
<div class="popper-container">
${text}
</div>
</body>
</html>`;
}
