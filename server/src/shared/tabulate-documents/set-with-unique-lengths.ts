export class SetWithUniqueLengths extends Set<string> {
    uniqueLengths: Set<number>;

    constructor(strings?: string[]) {
        super(strings);
        this.uniqueLengths = new Set<number>();
        if (strings) {
            strings.forEach(word => this.add(word))
        }
    }

    add(v) {
        this.uniqueLengths.add(v.length)
        super.add(v);
        return this;
    }
}