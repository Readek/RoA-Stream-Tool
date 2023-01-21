import { viewport } from "./Viewport.mjs";
import { charFinder } from "./Finder/Char Finder.mjs";
import { players } from "./Player/Players.mjs";
import { wl } from "./WinnersLosers.mjs";
import { inside, stPath } from "./Globals.mjs";
import { getJson, saveJson } from "./File System.mjs";
import { gamemode } from "./Gamemode Change.mjs";


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

        // always on top is electron only
        if (inside.electron) {
            this.#setAlwaysOnTopListener();
        } else {
            this.#alwaysOnTopCheck.disabled = true;
        }

        // dont forget about the copy match to clipboard button
        document.getElementById("copyMatch").addEventListener("click", () => {this.copyMatch()});

        // clicking the settings button will bring up the menu
        document.getElementById('settingsRegion').addEventListener("click", () => {
            viewport.toSettings()
        });

        this.load();

    }

    /** Loads all settings from the "GUI Settings.json" file */
    async load() {

        // get us the json file
        
        const guiSettings = await getJson(`${stPath.text}/GUI Settings`);

        // and update it all!
        this.#introCheck.checked = guiSettings.allowIntro;
        this.#altArtCheck.checked = guiSettings.forceAlt;
        this.#HDCheck.checked = guiSettings.forceHD;
        if (guiSettings.forceHD) this.#noLoACheck.disabled = false;
        this.#noLoACheck.checked = guiSettings.noLoAHD;
        this.#wsCheck.checked = guiSettings.workshop;
        if (guiSettings.workshop) this.#altArtCheck.disabled = false;
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
    async save(name, value) {
    
        // read the file
        const guiSettings = await getJson(`${stPath.text}/GUI Settings`);

        // update the setting's value
        guiSettings[name] = value;

        // save the file
        saveJson(`${stPath.text}/GUI Settings`, guiSettings);

    }

    setIntro(value) {
        this.#introCheck.checked = value;
    }
    isIntroChecked() {
        return this.#introCheck.checked;
    }

    setAltArt(value) {
        this.#altArtCheck.checked = value;
    }
    isAltArtChecked() {
        return this.#altArtCheck.checked;
    }
    toggleAltArt() {

        // TODO

        // save current checkbox value to the settings file
        this.save("forceAlt", this.isAltArtChecked());

    }

    setHD(value) {
        this.#HDCheck.checked = value;
    }
    isHDChecked() {
        return this.#HDCheck.checked;
    }
    async toggleHD() {

        // enables or disables the second forceHD option
        this.#noLoACheck.disabled = !this.isHDChecked();
        if (this.#noLoACheck.disabled) {
            this.#noLoACheck.checked = false;
            this.save("noLoAHD", false);
        }

        // to update character images
        const promises = [];
        for (let i = 0; i < players.length; i++) {
            promises.push(players[i].setVsImg());
            promises.push(players[i].setVsBg());
            promises.push(players[i].setTrailImage());
        }

        // save current checkbox value to the settings file
        this.save("forceHD", this.isHDChecked());

        await Promise.all(promises);

    }

    setNoLoA(value) {
        this.#noLoACheck.checked = value;
    }
    isNoLoAChecked() {
        return this.#noLoACheck.checked;
    }
    async toggleNoLoA() {

        // to update character images
        const promises = [];
        for (let i = 0; i < players.length; i++) {
            promises.push(players[i].setVsImg());
            promises.push(players[i].setVsBg());
            promises.push(players[i].setTrailImage());
        }
        await Promise.all(promises);

        // save current checkbox value to the settings file
        this.save("noLoAHD", this.isNoLoAChecked());

    }

    setWs(value) {
        this.#wsCheck.checked = value;
    }
    isWsChecked() {
        return this.#wsCheck.checked;
    }
    toggleWs() {

        // set a new character path
        stPath.char = this.isWsChecked() ? stPath.charWork : stPath.charBase;

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

    setForceWL(value) {
        this.#forceWLCheck.checked = value;
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

    async #setAlwaysOnTopListener() {
        const ipc = await import("./IPC.mjs");
        this.#alwaysOnTopCheck.addEventListener("click", () => {
            ipc.alwaysOnTop(this.#alwaysOnTopCheck.checked);
            this.save("alwaysOnTop", this.#alwaysOnTopCheck.checked);
        });
    }

    /**
     * Will copy the current match info to the clipboard
     * Format: "Tournament Name - Round - Player1 (Character1) VS Player2 (Character2)"
     */
    copyMatch() {

        // initialize the string
        let copiedText = tournamentInp.value + " - " + roundInp.value + " - ";

        if (gamemode.getGm() == 1) { // for singles matches
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
        }

        // send the string to the user's clipboard
        navigator.clipboard.writeText(copiedText);

    }

}

export const settings = new GuiSettings;