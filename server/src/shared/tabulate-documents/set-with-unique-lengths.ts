export class SetWithUniqueLengths {
    uniqueLengths = new Set<number>();
    set = new Set<string>();
    constructor(strings?: string[]) {
        if (strings) {
            strings.forEach(string => this.add(string))
        }
    }

    add(v: string) {
        this.set.add(v);
        this.uniqueLengths.add(v.length)
    }
    delete(v: string) {
        // TODO this doesn't delete from uniqueLengths, might be a problem in future
        // Could be solved with a map with counts
        this.set.delete(v)
    }
    has(v: string)  {
        return this.set.has(v);
    }
    values() {
        return this.set.values()
    }
}