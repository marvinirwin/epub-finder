import {Global, Module} from '@nestjs/common';
import { ObservableGateway } from './observable.gateway';
import {ObservableService} from "./observable.service";

@Global()
@Module({
    providers: [ ObservableGateway, ObservableService ]
})
export class ObservableModule {}