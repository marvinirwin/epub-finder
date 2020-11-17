import {ReplaySubject, Subject} from "rxjs";
import {NamedDeltaScanner} from "../Tree/DeltaScanner";
import {CustomDocument, Website} from "../Website/Website";
import {MyAppDatabase} from "../Storage/AppDB";
import {websiteFromFilename} from "../../AppSingleton";
import {withLatestFrom} from "rxjs/operators";
import {interpolateSimpleCustomDoc} from "../../services/simple-custom-doc.service";

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
            const html = interpolateSimpleCustomDoc(text);
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
            'TongueTwister.html',
            'Story4.html',
            'Story3.html',
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

    appendCustomDocuments(customDocuments: CustomDocument[]) {
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
        const setting$ = await this.db.checkedOutBooks$;
        // Automatically add an open book once a custom document is added
        setting$.next({...setting$.getValue(), [name]: true});
    }

    async deleteCustomDocument(b: CustomDocument) {
        await this.db.customDocuments.delete(b.name);
        this.customBooks$.appendDelta$.next({
            nodeLabel: 'root',
            children: {
                [b.name]: {
                    delete: true,
                    nodeLabel: b.name
                }
            }
        })
    }
}

