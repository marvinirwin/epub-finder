import {UnitTestAudio} from "../Audio/UnitTestAudio";
import {UnitTestAtomize} from "./UnitTestAtomize";

export class TestContext {
    audioSource = new UnitTestAudio('YEET');
    getPageRenderer = UnitTestAtomize;
}