const SExpressionParser = {
    parse(expression) {
        this._expression = expression;
        this._cursor = 0;
        this._ast = [];

        return this._parseExpression();
    },

    /**
     * s-exp : atom
     *       | list
     */
    _parseExpression() {
        this._whitespace();

        if (this._expression[this._cursor] === '(') {
            return this._parseList();
        }

        return this._parseAtom();
    },

    /**
     * list : '(' list-entries ')'
     */
    _parseList() {
        // Allocate a new (sub-)list.
        this._ast.push([]);

        this._expect('(');
        this._parseListEntries();
        this._expect(')');

        return this._ast[0];
    },

    /**
     * list-entries : s-exp list-entries
     *              | ε
     */
    _parseListEntries() {
        this._whitespace();

        // ε
        if (this._expression[this._cursor] === ')') {
            return;
        }

        // s-exp list-entries

        let entry = this._parseExpression();

        if (entry !== '') {
            // Lists may contain nested sub-lists. In case we have parsed a nested
            // sub-list, it should be on top of the stack (see `_parseList` where we
            // allocate a list and push it onto the stack). In this case we don't
            // want to push the parsed entry to it (since it's itself), but instead
            // pop it, and push to previous (parent) entry.

            if (Array.isArray(entry)) {
                entry = this._ast.pop();
            }

            this._ast[this._ast.length - 1].push(entry);
        }

        return this._parseListEntries();
    },

    /**
     * atom : symbol
     *      | number
     */
    _parseAtom() {
        const terminator = /\s+|\)/;
        let atom = '';

        const addToAtom = () => {
            atom += this._expression[this._cursor];
            this._cursor++;
        }

        if (this._expression[this._cursor] === `"`) {
            addToAtom()
            while (this._expression[this._cursor] !== `"`) {
                addToAtom()
            }
            addToAtom()
        } else {
            while (this._expression[this._cursor] && !terminator.test(this._expression[this._cursor])) {
                addToAtom();
            }
        }

        if (atom !== '' && !isNaN(atom)) {
            atom = Number(atom);
        }

        return atom;
    },

    _whitespace() {
        const ws = /^\s+/;
        while (this._expression[this._cursor] &&
        ws.test(this._expression[this._cursor])) {
            this._cursor++;
        }
    },

    _expect(c) {
        if (this._expression[this._cursor] !== c) {
            throw new Error(
                `Unexpected token: ${this._expression[this._cursor]}, expected ${c}.`
            );
        }
        this._cursor++;
    }
};

module.exports = SExpressionParser;

