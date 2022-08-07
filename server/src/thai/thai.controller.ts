import {Body, Controller, Post} from "@nestjs/common";
import wordcut from "wordcut";
wordcut.init();

@Controller("thai")
export class ThaiController {
  @Post("separate")
  findAll(@Body() body: {text: string}): string[] {
    return wordcut.cutIntoArray(body.text);
  }
}
