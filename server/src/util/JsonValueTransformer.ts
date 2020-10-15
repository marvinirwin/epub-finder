import {ValueTransformer} from "typeorm";

export class JsonValueTransformer<T> implements ValueTransformer {
    to (value: T): string {
        return JSON.stringify(value);
    }

    from (value: string): T {
        return JSON.parse(value);
    }
}