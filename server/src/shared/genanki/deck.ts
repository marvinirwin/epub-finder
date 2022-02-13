import { Note } from "./note";

export class Deck {
    notes: Note[]
    id: string;
    name: string;
    desc: string;
    constructor(id, name, desc="") {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.notes = [];
    }

    addNote(note) {
        this.notes.push(note);
    }
}
