import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {ObservableService} from "./observable.service";

@WebSocketGateway()
export class ObservableGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server;

    constructor(
        private observableService: ObservableService
    ) {
        this.observableService.videoMetadataEvents$.subscribe(v => this.server.emit('videoMetadata', v))
/*
TODO this will require verifying users
        this.observableService.documentEvents$.subscribe(v => this.server.emit('document', v))
*/
    }


    async handleConnection(){
        console.log(`Client connected`);
    }

    async handleDisconnect(){
        console.log(`Client disconnected`)
    }
}