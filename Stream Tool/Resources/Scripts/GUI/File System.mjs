import { casters } from './Caster/Casters.mjs';
import { inside, stPath } from './Globals.mjs';
import { players } from './Player/Players.mjs';
import { round } from './Round.mjs';
import { scores } from './Score/Scores.mjs';
import { teams } from './Team/Teams.mjs';
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
            return await (await fetch(jPath + ".json", {cache: "no-store"})).json();
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

        return (await fetch(filePath, {method: "HEAD"})).ok;
    
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

        // save the data for the remote gui
        saveJson(`/Character List`, characterList);

        return characterList;

    } else {
        
        return await getJson(`${stPath.text}/Character List`);

    }

}

/**
 * Generates a json with each of the files on a presets folder
 * @returns Array of preset jsons
 */
export async function getPresetList(folderName) {

    if (inside.electron) {
        
        // get us the files to look for
        const fs = require('fs');
        const files = fs.readdirSync(`${stPath.text}/${folderName}/`);

        // for each file, add a new entry with its data
        const jsonList = [];
        for (let i = 0; i < files.length; i++) {
            files[i] = files[i].substring(0, files[i].length - 5); // remove .json
            jsonList.push(await getJson(`${stPath.text}/${folderName}/${files[i]}`));
        }

        // save for remote gui
        saveJson(`/${folderName}`, jsonList);

        return jsonList;

    } else {

        return await getJson(`${stPath.text}/${folderName}`);
        
    }
    
}

/**
 * Saves a local json file with the provided values
 * @param {String} path - Path where the file will be saved
 * @param {Object} data - Data to be saved
 */
export async function saveJson(path, data) {

    if (inside.electron) {

        // save the file
        const fs = require('fs');
        fs.writeFileSync(`${stPath.text}${path}.json`, JSON.stringify(data, null, 2));
        
        // send signal to update remote GUIs
        const ipc = await import("./IPC.mjs");
        ipc.updateRemotePresets();

    } else {
        const remote = await import("./Remote Requests.mjs");
        data.message = "RemoteSaveJson";
        data.path = path;
        remote.sendRemoteData(data);
    }
    
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