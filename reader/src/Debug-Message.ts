export default class DebugMessage {
    timestamp: Date;
    public prefix: string;
    public message: string;
    constructor(prefix: string, message: string) {
        this.prefix = prefix;
        this.message = message;
        this.timestamp = new Date();
    }
}