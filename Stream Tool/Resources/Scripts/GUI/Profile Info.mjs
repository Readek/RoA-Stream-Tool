import { getJson, saveJson } from "./File System.mjs";
import { viewport } from "./Viewport.mjs";
import { displayNotif } from "./Notifications.mjs";
import { stPath } from "./Globals.mjs";
import { playerFinder } from "./Finder/Player Finder.mjs";
import { commFinder } from "./Finder/Comm Finder.mjs";

class ProfileInfo {

    #pInfoDiv = document.getElementById("pInfoDiv");

    #pTypeSpan = document.getElementById("pInfoType");

    #inputs = document.getElementsByClassName("pInfoInput");

    #pronounsInp = document.getElementById("pInfoInputPronouns");
    #tagInp = document.getElementById("pInfoInputTag");
    #nameInp = document.getElementById("pInfoInputName");
    #twitchInp = document.getElementById("pInfoInputTwitch");
    #ytInp = document.getElementById("pInfoInputYt");
    #twitterInp = document.getElementById("pInfoInputTwitter");
    #mastoInp = document.getElementById("pInfoInputMasto");
    #cohostInp = document.getElementById("pInfoInputCohost");

    #curProfile;

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
     * @param {PlayerGame} profile Player data to fill inputs
     */
    show(profile) {

        // update player number text
        this.#pTypeSpan.textContent = profile.profileType;

        // display the current info for this player
        this.#pronounsInp.value = profile.getPronouns();
        this.#tagInp.value = profile.getTag();
        this.#nameInp.value = profile.getName();
        const socials = profile.getSocials() || [];
        this.#twitterInp.value = socials.twitter || "";
        this.#twitchInp.value = socials.twitch || "";
        this.#ytInp.value = socials.yt || "";
        this.#mastoInp.value = socials.masto || "";
        this.#cohostInp.value = socials.cohost || "";

        // give tab index so we can jump from input to input with the keyboard
        this.#setTabIndex(0);

        // display the overall div
        this.#pInfoDiv.style.pointerEvents = "auto";
        this.#pInfoDiv.style.opacity = 1;
        this.#pInfoDiv.style.transform = "scale(1)";
        viewport.opacity(".25");

        // store current class for later
        this.#curProfile = profile;

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
        for (let i = 0; i < this.#inputs.length; i++) {
            this.#inputs[i].setAttribute("tabindex", num);
        }
    }

    /** Updates player data with values from input fields */
    apply() {
        
        this.#curProfile.pronouns = this.#pronounsInp.value;
        this.#curProfile.setTag(this.#tagInp.value);
        this.#curProfile.setName(this.#nameInp.value);

        const socials = {
            twitter : this.#twitterInp.value,
            twitch : this.#twitchInp.value,
            yt : this.#ytInp.value,
            masto : this.#mastoInp.value,
            cohost : this.#cohostInp.value,
        }
        this.#curProfile.setSocials(socials);
        
    }

    async savePreset() {
    
        const preset = {
            name: this.#curProfile.getName(),
            tag: this.#curProfile.getTag(),
            pronouns: this.#curProfile.getPronouns(),
            socials: this.#curProfile.getSocials(),
        }
        if (this.#curProfile.profileType == "player") {

            preset.characters = [{
                character: this.#curProfile.char,
                skin: this.#curProfile.skin.name
            }];
            if (this.#curProfile.customImg) {
                preset.characters[0].hex = this.#curProfile.skin.hex;
                preset.characters[0].customImg = true;
            }

            // if a player preset for this player exists, add already existing characters
            const existingPreset = await getJson(`${stPath.text}/Player Info/${this.#nameInp.value}`)
            if (existingPreset) {
                
                // add existing characters to the new json, but not if the character is the same
                for (let i = 0; i < existingPreset.characters.length; i++) {
                    if (existingPreset.characters[i].character != this.#curProfile.char) {
                        preset.characters.push(existingPreset.characters[i]);
                    }
                }
        
            }

        }
    
        
        if (this.#curProfile.profileType == "player") {
            saveJson(`/Player Info/${this.#nameInp.value}`, preset);
            displayNotif("Player preset has been saved");
            playerFinder.setPlayerPresets();
        } else {
            saveJson(`/Commentator Info/${this.#nameInp.value}`, preset);
            displayNotif("Commentator preset has been saved");
            commFinder.setCasterPresets();
        }
        
    
    }

}

export const profileInfo = new ProfileInfo;