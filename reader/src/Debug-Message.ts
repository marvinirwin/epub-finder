export default class DebugMessage {
    timestamp: Date;
    constructor(public prefix: string, public message: string) {
        this.timestamp = new Date();
    }
}