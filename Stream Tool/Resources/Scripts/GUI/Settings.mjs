import { viewport } from "./Viewport.mjs";
import * as glob from './Globals.mjs';
import { charFinder } from "./Finder/Char Finder.mjs";
import { players } from "./Players.mjs";
const fs = require('fs');


class GuiSettings {

    #introCheck = document.getElementById("allowIntro");
    #altArtCheck = document.getElementById("forceAlt");

    #HDCheck = document.getElementById('forceHD');
    #noLoACheck = document.getElementById('noLoAHD');

    #wsCheck = document.getElementById('workshopToggle');

    constructor() {

        // scoreboard listeners
        this.#introCheck.addEventListener("click", () => {
            this.save("allowIntro", this.#introCheck.checked)
        });
        this.#altArtCheck.addEventListener("click", () => {this.toggleAltArt()});

        // vs screen listeners
        this.#HDCheck.addEventListener("click", () => {this.toggleHD()});
        this.#noLoACheck.addEventListener("click", () => {this.toggleNoLoA()});

        // gui settings listeners
        this.#wsCheck.addEventListener("click", () => {this.toggleWs()});


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

}

export const settings = new GuiSettings;