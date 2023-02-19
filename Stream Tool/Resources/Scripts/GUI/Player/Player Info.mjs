import { getJson, saveJson } from "../File System.mjs";
import { viewport } from "../Viewport.mjs";
import { displayNotif } from "../Notifications.mjs";
import { stPath } from "../Globals.mjs";
import { playerFinder } from "../Finder/Player Finder.mjs";

class PlayerInfo {

    #pInfoDiv = document.getElementById("pInfoDiv");

    #pNumSpan = document.getElementById("pInfoPNum");

    #pronounsInp = document.getElementById("pInfoInputPronouns");
    #tagInp = document.getElementById("pInfoInputTag");
    #nameInp = document.getElementById("pInfoInputName");
    #twitterInp = document.getElementById("pInfoInputTwitter");
    #twitchInp = document.getElementById("pInfoInputTwitch");
    #ytInp = document.getElementById("pInfoInputYt");

    #curPlayer;

    constructor() {

        document.getElementById("pInfoBackButt").addEventListener("click", () => {
            this.hide();
        });
        document.getElementById("pInfoSaveButt").addEventListener("click", () => {
            this.apply();
            this.savePreset();
            this.hide();
        });
        document.getElementById("pInfoApplyButt").addEventListener("click", () => {
            this.apply();
            this.hide();
        });

    }

    /**
     * Checks if the player info menu is currently visible
     * @returns True if menu is visible, false if not
     */
    isVisible() {
        return this.#pInfoDiv.style.pointerEvents == "auto";
    }

    /**
     * Displays the player info div on screen
     * @param {PlayerGame} player Player data to fill inputs
     */
    show(player) {

        // update player number text
        this.#pNumSpan.textContent = player.pNum + 1;

        // display the current info for this player
        this.#pronounsInp.value = player.pronouns;
        this.#tagInp.value = player.getTag();
        this.#nameInp.value = player.getName();
        this.#twitterInp.value = player.twitter;
        this.#twitchInp.value = player.twitch;
        this.#ytInp.value = player.yt;

        // give tab index so we can jump from input to input with the keyboard
        this.#setTabIndex(0);

        // display the overall div
        this.#pInfoDiv.style.pointerEvents = "auto";
        this.#pInfoDiv.style.opacity = 1;
        this.#pInfoDiv.style.transform = "scale(1)";
        viewport.opacity(".25");

        // store current player for later
        this.#curPlayer = player;

    }

    /** Hides the player info div */
    hide() {

        this.#pInfoDiv.style.pointerEvents = "none";
        this.#pInfoDiv.style.opacity = 0;
        this.#pInfoDiv.style.transform = "scale(1.15)";
        viewport.opacity("1");
    
        this.#setTabIndex("-1");

    }

    /**
     * Sets a tab index value for all input elements inside the player info div
     * @param {Number} num - Tab index value
     */
    #setTabIndex(num) {
        this.#pronounsInp.setAttribute("tabindex", num);
        this.#tagInp.setAttribute("tabindex", num);
        this.#nameInp.setAttribute("tabindex", num);
        this.#twitterInp.setAttribute("tabindex", num);
        this.#twitchInp.setAttribute("tabindex", num);
        this.#ytInp.setAttribute("tabindex", num);
    }

    /** Updates player data with values from input fields */
    apply() {
        
        this.#curPlayer.pronouns = this.#pronounsInp.value;
        this.#curPlayer.setTag(this.#tagInp.value);
        this.#curPlayer.setName(this.#nameInp.value);
        this.#curPlayer.twitter = this.#twitterInp.value;
        this.#curPlayer.twitch = this.#twitchInp.value;
        this.#curPlayer.yt = this.#ytInp.value;
        
    }

    async savePreset() {
    
        const preset = {
            name: this.#curPlayer.getName(),
            tag: this.#curPlayer.getTag(),
            pronouns: this.#curPlayer.pronouns,
            twitter: this.#curPlayer.twitter,
            twitch: this.#curPlayer.twitch,
            yt: this.#curPlayer.yt,
            characters : [{
                character: this.#curPlayer.char,
                skin: this.#curPlayer.skin.name
            }]
        }
        if (this.#curPlayer.customImg) {
            preset.characters[0].hex = this.#curPlayer.skin.hex;
            preset.characters[0].customImg = true;
        }
    
        // if a player preset for this player exists, add already existing characters
        const existingPreset = await getJson(`${stPath.text}/Player Info/${this.#nameInp.value}`)
        if (existingPreset) {
            
            // add existing characters to the new json, but not if the character is the same
            for (let i = 0; i < existingPreset.characters.length; i++) {
                if (existingPreset.characters[i].character != this.#curPlayer.char) {
                    preset.characters.push(existingPreset.characters[i]);
                }
            }
    
        }
    
        saveJson(`/Player Info/${this.#nameInp.value}`, preset);
    
        displayNotif("Player preset has been saved");

        // generate a new player presets list
        playerFinder.setPlayerPresets();
    
    }

}

export const playerInfo = new PlayerInfo;