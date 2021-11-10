import {generateAnkiDeck} from "./generate-anki-deck";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "../app.module";
import {TabulateService} from "../documents/similarity/tabulate.service";

it("Generates anki deck on the command line", async () => {
    const app = await NestFactory.create(AppModule);
    const tabulateService = app.get(TabulateService);
    generateAnkiDeck({
        customArgv: ["TODO"],
        // TODO are repositories injectable?
        cardRepository: app.get(),
        customWordRepository: app.get(),
        documentRepository: app.get(),
    });
});