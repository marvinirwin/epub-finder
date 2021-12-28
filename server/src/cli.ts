import { config } from "dotenv";
import { NestFactory } from "@nestjs/core";
import {CliService} from "./cli/cli.service";

config({ path: ".env" });

async function bootstrap() {
    const app = await NestFactory.create(CliModule);
    const cliService = app.get(CliService);
    cliService.exec();
}

bootstrap();
