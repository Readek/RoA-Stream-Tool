import { saveJson } from "../File System.mjs";
import { commFinder } from "../Finder/Comm Finder.mjs";
import { inside, stPath } from "../Globals.mjs";
import { displayNotif } from "../Notifications.mjs";

export class Caster {

    #nameEl;
    #twitterEl;
    #twitchEl;
    #ytEl;
    #saveEl;

    constructor(el) {

        this.#nameEl = el.getElementsByClassName(`cName`)[0];
        this.#twitterEl = el.getElementsByClassName(`cTwitter`)[0];
        this.#twitchEl = el.getElementsByClassName(`cTwitch`)[0];
        this.#ytEl = el.getElementsByClassName(`cYt`)[0];
        this.#saveEl = el.getElementsByClassName(`saveCasterButt`)[0];

        // every time we type on name
        this.#nameEl.addEventListener("input", () => {

            // check to disable or enable save button
            if (this.getName()) {
                this.#saveEl.disabled = false;
            } else {
                this.#saveEl.disabled = true;
            }

            // check if theres an existing caster preset
            commFinder.fillFinderPresets(this);

            // position the finder dropdown depending on contents
            commFinder.positionFinder();

        });

        // if we click on the name text input
        this.#nameEl.addEventListener("focusin", () => {
            commFinder.fillFinderPresets(this);
            commFinder.open(this.#nameEl.parentElement);
        });
        // hide the presets dropdown if text input loses focus
        this.#nameEl.addEventListener("focusout", () => {
            if (!inside.finder) {
                commFinder.hide();
            }
        });

        // every time we click on the save button
        this.#saveEl.addEventListener("click", () => {this.#savePreset()});

    }

    getName() {
        return this.#nameEl.value;
    }
    getTwitter() {
        if (this.#twitterEl.value == "") {
            return "-";
        } else {
            return this.#twitterEl.value;
        }
    }
    getTwitch() {
        if (this.#twitchEl.value == "") {
            return "-";
        } else {
            return this.#twitchEl.value;
        }
    }
    getYt() {
        if (this.#ytEl.value == "") {
            return "-";
        } else {
            return this.#ytEl.value;
        }
    }
    setName(text) {
        this.#nameEl.value = this.#checkText(text);
    }
    setTwitter(text) {
        this.#twitterEl.value = this.#checkText(text);
    }
    setTwitch(text) {
        this.#twitchEl.value = this.#checkText(text);
    }
    setYt(text) {
        this.#ytEl.value = this.#checkText(text);
    }
    /**
     * Checks if the text is a simple "-" to be able to return nothing
     * @param {String} text String to check
     * @returns {String} Final text
     */
    #checkText(text) {
        if (text == "-") {
            return "";
        }
        return text;
    }

    /** Saves a commentator local json as a preset */
    #savePreset() {

        // save current info to an object
        const preset = {
            name: this.getName(),
            twitter: this.getTwitter(),
            twitch: this.getTwitch(),
            yt: this.getYt()
        };

        // use this object to create a json file
        saveJson(`/Commentator Info/${this.getName()}`, preset);

        displayNotif("Commentator preset has been saved");

        // generate a new presets list
        commFinder.setCasterPresets();

    }

}