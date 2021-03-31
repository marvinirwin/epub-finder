import { Manager } from './lib/manager/Manager'
import { DatabaseService } from './lib/Storage/database.service'
import { BrowserAudio } from './lib/audio/browser.audio'

export function getManager(mode: string): Manager {
    return new Manager(new DatabaseService(), {
        audioSource: new BrowserAudio(),
    })
}
