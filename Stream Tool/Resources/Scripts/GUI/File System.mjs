import { casters } from './Casters.mjs';
import { inside, stPath } from './Globals.mjs';
import { players } from './Player/Players.mjs';
import { round } from './Round.mjs';
import { scores } from './Scores.mjs';
import { teams } from './Teams.mjs';
import { tournament } from './Tournament.mjs';

/**
 * Returns parsed json data from a local file
 * @param {String} jPath - Path to local file
 * @returns {Object?} - Parsed json object
*/
export async function getJson(jPath) {

    if (inside.electron) {

        // the electron version
        const fs = require('fs');
        if (fs.existsSync(jPath + ".json")) {
            return JSON.parse(fs.readFileSync(jPath + ".json"));
        } else {
            return null;
        }

    } else {

        // the browser version
        try {
            const response = await (await fetch(jPath + ".json")).json();
            return response;
        } catch (e) {
            return null;
        }

    }

}

/**
 * Checks if the requested file exists/can be accessed
 * @param {String} filePath - Path to the file
 * @returns True or False, pretty self explanatory if you ask me
 */
export async function fileExists(filePath) {

    if (inside.electron) {

        const fs = require('fs');
        return fs.existsSync(filePath);
        
    } else {

        try {
            if ((await fetch(filePath)).ok) {
                return true;
            }
        } catch (e) {
            return null;
        }
        
    }

}

/**
 * Generates a character list depending on the folders of the character path
 * @returns Character list array
 */
export async function getCharacterList() {

    if (inside.electron) {
        
        const fs = require('fs');
        const characterList = fs.readdirSync(stPath.char, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter((name) => {
                // if the folder name contains '_Workshop' or 'Random', exclude it
                if (name != "_Workshop" && name != "Random") {
                    return true;
                }
            }
        )

        // add random to the end of the character list
        characterList.push("Random");

        return characterList;

    } else {
        
        return ["Absa", "Maypul", "Zetterburn"]

    }

}

/**
 * Generates a list with each of the files on a presets folder
 * @returns Array of preset names
 */
export async function getPresetList(folderName) {
    const fs = require('fs');
    return fs.readdirSync(`${stPath.text}/${folderName}/`);
}

/**
 * Saves a local json file with the provided values
 * @param {String} path - Path where the file will be saved
 * @param {Object} data - Data to be saved
 */
export function saveJson(path, data) {
    const fs = require('fs');
    fs.writeFileSync(`${path}.json`, JSON.stringify(data, null, 2));
}

/** Saves simple text files to a folder, to be read by other programs */
export function saveSimpleTexts() {

    const fs = require('fs');

    for (let i = 0; i < players.length; i++) {
        fs.writeFileSync(`${stPath.text}/Simple Texts/Player ${i+1}.txt`, players[i].getName());        
    }

    fs.writeFileSync(`${stPath.text}/Simple Texts/Team 1.txt`, teams[0].getName());
    fs.writeFileSync(`${stPath.text}/Simple Texts/Team 2.txt`, teams[1].getName());

    fs.writeFileSync(`${stPath.text}/Simple Texts/Score L.txt`, scores[0].getScore().toString());
    fs.writeFileSync(`${stPath.text}/Simple Texts/Score R.txt`, scores[1].getScore().toString());

    fs.writeFileSync(`${stPath.text}/Simple Texts/Round.txt`, round.getText());
    fs.writeFileSync(`${stPath.text}/Simple Texts/Tournament Name.txt`, tournament.getText());

    for (let i = 0; i < casters.length; i++) {
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Name.txt`, casters[i].getName());
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Twitter.txt`, casters[i].getTwitter());
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Twitch.txt`, casters[i].getTwitch());
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Youtube.txt`, casters[i].getYt());
    }
    
}