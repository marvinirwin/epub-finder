class trie_node<T> {
    public terminal: boolean;
    public children: Map<string, trie_node<T>>;

    constructor(public value?: T | null) {
        this.terminal = false;
        this.children = new Map();
    }
}

export class trie<T> {
    private root: trie_node<T>;
    private elements: number;

    constructor() {
        this.root = new trie_node<T>();
        this.elements = 0;
    }

    public get length(): number {
        return this.elements;
    }

    public get(key: string): T | null {
        const node = this.getNode(key);
        if (node) {
            return node.value || null;
        }
        return null;
    }

    public contains(key: string): boolean {
        const node = this.getNode(key);
        return !!node;
    }

    public insert(key: string, value: T): void {
        let node = this.root;
        let remaining = key;
        while (remaining.length > 0) {
            let child: trie_node<T> | null = null;

            for (const childKey of Array.from(node.children.keys())) {
                const prefix = this.commonPrefix(remaining, childKey);
                if (!prefix.length) {
                    continue;
                }
                if (prefix.length === childKey.length) {
                    // enter child node
                    child = node.children.get(childKey) || null;
                    remaining = remaining.slice(childKey.length);
                    break;
                } else {
                    // split the child
                    child = new trie_node<T>();
                    let splitChild = node.children.get(childKey);
                    if (!splitChild) {
                        throw new Error("No child while splitting child")
                    }
                    child.children.set(
                        childKey.slice(prefix.length),
                        splitChild
                    );
                    node.children.delete(childKey);
                    node.children.set(prefix, child);
                    remaining = remaining.slice(prefix.length);
                    break;
                }
            }
            if (!child && remaining.length) {
                child = new trie_node<T>();
                node.children.set(remaining, child);
                remaining = "";
            }
            if (!child) {
                throw new Error("This should probably not happen")
            }
            node = child;
        }
        if (!node.terminal) {
            node.terminal = true;
            this.elements += 1;
        }
        node.value = value;
    }

    public remove(key: string): void {
        const node = this.getNode(key);
        if (node) {
            node.terminal = false;
            this.elements -= 1;
        }
    }

    public map<U>(prefix: string, func: (key: string, value: T) => U): U[] {
        const mapped = [];
        const node = this.getNode(prefix);
        const stack: [string, trie_node<T>][] = [];
        if (node) {
            stack.push([prefix, node]);
        }
        while (stack.length) {
            const v = stack.pop();
            if (!v) {
                throw new Error("Something wrong with stack")
            }
            const [key, node] = v;
            if (!node.value) {
                throw new Error("Something wrong with node on stack")
            }
            if (node.terminal) {
                mapped.push(func(key, node.value));
            }
            for (const c of Array.from(node.children.keys())) {
                let newVar = node.children.get(c);
                if (!newVar) {
                    throw new Error("Something wrong with node on stack")
                }
                stack.push([key + c, newVar]);
            }
        }
        return mapped;
    }

    private getNode(key: string): trie_node<T> | null {
        let node = this.root;
        let remaining = key;
        while (node && remaining.length > 0) {
            let child = null;
            for (let i = 1; i <= remaining.length; i += 1) {
                child = node.children.get(remaining.slice(0, i));
                if (child) {
                    remaining = remaining.slice(i);
                    break;
                }
            }
            if (!child) {
                throw new Error("Something wrong getnode")
            }
            node = child;
        }
        return remaining.length === 0 && node && node.terminal ? node : null;
    }

    private commonPrefix(a: string, b: string): string {
        const shortest = Math.min(a.length, b.length);
        let i = 0;
        for (; i < shortest; i += 1) {
            if (a[i] !== b[i]) {
                break;
            }
        }
        return a.slice(0, i);
    }
}