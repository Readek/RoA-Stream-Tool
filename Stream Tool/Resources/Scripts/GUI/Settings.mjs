import { viewport } from "./Viewport.mjs";
import * as glob from './Globals.mjs';
import { charFinder } from "./Finder/Char Finder.mjs";
import { players } from "./Player/Players.mjs";
import { wl } from "./WinnersLosers.mjs";
const fs = require('fs');
const ipc = require('electron').ipcRenderer;


class GuiSettings {

    #introCheck = document.getElementById("allowIntro");
    #altArtCheck = document.getElementById("forceAlt");

    #HDCheck = document.getElementById('forceHD');
    #noLoACheck = document.getElementById('noLoAHD');

    #wsCheck = document.getElementById('workshopToggle');
    #forceWLCheck = document.getElementById('forceWLToggle');
    #scoreAutoCheck = document.getElementById("scoreAutoUpdate");
    #invertScoreCheck = document.getElementById("invertScore");
    #alwaysOnTopCheck = document.getElementById("alwaysOnTop");

    constructor() {

        // scoreboard listeners
        this.#introCheck.addEventListener("click", () => {
            this.save("allowIntro", this.isIntroChecked())
        });
        this.#altArtCheck.addEventListener("click", () => {this.toggleAltArt()});

        // vs screen listeners
        this.#HDCheck.addEventListener("click", () => {this.toggleHD()});
        this.#noLoACheck.addEventListener("click", () => {this.toggleNoLoA()});

        // gui settings listeners
        this.#wsCheck.addEventListener("click", () => {this.toggleWs()});
        this.#forceWLCheck.addEventListener("click", () => {this.toggleForceWL()});
        this.#scoreAutoCheck.addEventListener("click", () => {
            this.save("scoreAutoUpdate", this.isScoreAutoChecked())
        });
        this.#invertScoreCheck.addEventListener("click", () => {
            this.save("invertScore", this.isInvertScoreChecked())
        });
        this.#alwaysOnTopCheck.addEventListener("click", () => {
            ipc.send('alwaysOnTop', this.#alwaysOnTopCheck.checked);
            this.save("alwaysOnTop", this.#alwaysOnTopCheck.checked);
        });

        // dont forget about the copy match to clipboard button
        document.getElementById("copyMatch").addEventListener("click", () => {this.copyMatch()});

        // clicking the settings button will bring up the menu
        document.getElementById('settingsRegion').addEventListener("click", () => {
            viewport.toSettings()
        });

        this.load();

    }

    /** Loads all settings from the "GUI Settings.json" file */
    load() {

        // get us the json file
        const guiSettings = JSON.parse(fs.readFileSync(`${glob.path.text}/GUI Settings.json`, "utf-8"));

        // and update it all!
        this.#introCheck.checked = guiSettings.allowIntro;
        this.#altArtCheck.checked = guiSettings.forceAlt;
        if (guiSettings.forceHD) this.#HDCheck.click();
        this.#noLoACheck.checked = guiSettings.noLoAHD;
        if (guiSettings.workshop) this.#wsCheck.click();
        if (guiSettings.forceWL) this.#forceWLCheck.click();
        this.#scoreAutoCheck.checked = guiSettings.scoreAutoUpdate;
        this.#invertScoreCheck.checked = guiSettings.invertScore;
        this.#alwaysOnTopCheck.checked = guiSettings.alwaysOnTop;

    }

    /**
     * Updates a setting inside "GUI Settings.json"
     * @param {String} name - Name of the json variable
     * @param {} value - Value to add to the variable
     */
    save(name, value) {
    
        // read the file
        const guiSettings = JSON.parse(fs.readFileSync(`${glob.path.text}/GUI Settings.json`, "utf-8"));

        // update the setting's value
        guiSettings[name] = value;

        // save the file
        fs.writeFileSync(`${glob.path.text}/GUI Settings.json`, JSON.stringify(guiSettings, null, 2));

    }

    isIntroChecked() {
        return this.#introCheck.checked;
    }

    isAltArtChecked() {
        return this.#altArtCheck.checked;
    }
    toggleAltArt() {

        //

        // save current checkbox value to the settings file
        this.save("forceAlt", this.isAltArtChecked());

    }

    isHDChecked() {
        return this.#HDCheck.checked;
    }
    toggleHD() {

        // enables or disables the second forceHD option
        this.#noLoACheck.disabled = !this.isHDChecked();
        if (this.#noLoACheck.disabled) {
            this.#noLoACheck.checked = false;
            this.save("noLoAHD", false);
        }

        // to update character images
        for (let i = 0; i < players.length; i++) {
            players[i].skinChange(players[i].skin);
        }

        // save current checkbox value to the settings file
        this.save("forceHD", this.isHDChecked());

    }

    isNoLoAChecked() {
        return this.#noLoACheck.checked;
    }
    toggleNoLoA() {

        // to update character images
        for (let i = 0; i < players.length; i++) {
            players[i].skinChange(players[i].skin);
        }

        // save current checkbox value to the settings file
        this.save("noLoAHD", this.isNoLoAChecked());

    }

    isWsChecked() {
        return this.#wsCheck.checked;
    }
    toggleWs() {

        // set a new character path
        glob.path.char = this.isWsChecked() ? glob.path.charWork : glob.path.charBase;

        // reload character lists
        charFinder.loadCharacters();
        // clear current character lists
        for (let i = 0; i < players.length; i++) {
            players[i].charChange("Random");
        }

        // disable or enable alt arts checkbox
        this.#altArtCheck.disabled = !this.isWsChecked();
        if (this.#altArtCheck.disabled) {
            this.#altArtCheck.checked = false;
            this.save("forceAlt", false);
        }

        // save current checkbox value to the settings file
        this.save("workshop", this.isWsChecked());

    }

    isForceWLChecked() {
        return this.#forceWLCheck.checked;
    }
    toggleForceWL() {

        // forces the W/L buttons to appear, or unforces them
        if (this.isForceWLChecked()) {
            wl.show();
        } else {
            wl.hide();
        }

        // save current checkbox value to the settings file
        this.save("forceWL", this.isForceWLChecked());

    }

    isScoreAutoChecked() {
        return this.#scoreAutoCheck.checked;
    }

    isInvertScoreChecked() {
        return this.#invertScoreCheck.checked;
    }

    /**
     * Will copy the current match info to the clipboard
     * Format: "Tournament Name - Round - Player1 (Character1) VS Player2 (Character2)"
     */
    copyMatch() {

        // initialize the string
        let copiedText = /* tournamentInp.value + " - " + roundInp.value + */ " - ";

        /* if (gamemode == 1) { // for singles matches
            // check if the player has a tag to add
            if (players[0].tag) {
                copiedText += players[0].tag + " | ";
            }
            copiedText += players[0].getName() + " (" + players[0].char +") VS ";
            if (players[1].tag) {
                copiedText += players[1].tag + " | ";
            }
            copiedText += players[1].getName() + " (" +  players[1].char +")";
        } else { // for team matches
            copiedText += tNameInps[0].value + " VS " + tNameInps[1].value;
        } */

        // send the string to the user's clipboard
        navigator.clipboard.writeText(copiedText);

    }

}

export const settings = new GuiSettings;