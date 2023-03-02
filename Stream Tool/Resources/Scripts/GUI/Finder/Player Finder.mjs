import { Finder } from "./Finder.mjs";
import { getJson, getPresetList } from '../File System.mjs';
import { getRecolorImage } from "../GetImage.mjs";
import { customChange, setCurrentPlayer } from "../Custom Skin.mjs";
import { current, stPath } from "../Globals.mjs";

class PlayerFinder extends Finder {

    #playerPresets;
    #presName; // to break playerpreset cycle


    constructor() {
        super(document.getElementById("playerFinder"));
        this.setPlayerPresets();
    }


    /** Sets a new player preset list from the presets folder */
    async setPlayerPresets() {
        this.#playerPresets = await getPresetList("Player Info");
    }

    /**
     * Fills the player preset finder depending on current player name
     * @param {Player} player - Player to find presets for
     */
    async fillFinderPresets(player) {

        //remove the "focus" for the player presets list
        current.focus = -1;

        // clear the current list each time we type
        this._clearList();

        // check for later
        let skinImgs = [];

        // if we typed at least 3 letters
        if (player.getName().length >= 3) {

            // check the files in that folder
            skinImgs = await this.#generatePresetList(player);

        }

        // if we got some presets, show up finder
        if (skinImgs.length) {
            this._finderEl.style.display = "block";
        } else {
            this._finderEl.style.display = "none";
        }

        return skinImgs;

    }

    async #generatePresetList(player) {

        const skinImgs = [];

        for (let i = 0; i < this.#playerPresets.length; i++) {

            const preset = this.#playerPresets[i]; // to simplify code

            // if the current text matches a file from that folder
            if (preset.name.toLocaleLowerCase().includes(player.getName().toLocaleLowerCase())) {

                // for each character that player plays
                for (let i = 0; i < preset.characters.length; i++) {
                    
                    // this will be the div to click
                    const newDiv = document.createElement('div');
                    newDiv.className = "finderEntry";
                    
                    //create the texts for the div, starting with the tag
                    const spanTag = document.createElement('span');
                    //if the tag is empty, dont do anything
                    if (preset.tag != "") {
                        spanTag.innerHTML = preset.tag;
                        spanTag.className = "pfTag";
                    }

                    // player name
                    const spanName = document.createElement('span');
                    spanName.innerHTML = preset.name;
                    spanName.className = "pfName";

                    // plapDatayer character
                    const spanChar = document.createElement('span');
                    spanChar.innerHTML = preset.characters[i].character;
                    spanChar.className = "pfChar";

                    // data to be accessed when clicked
                    const pData = {
                        name : preset.name,
                        tag : preset.tag,
                        pronouns : preset.pronouns,
                        twitter : preset.twitter,
                        twitch : preset.twitch,
                        yt : preset.yt,
                        char : preset.characters[i].character,
                        skin : preset.characters[i].skin,
                        hex : preset.characters[i].hex,
                        customImg : preset.characters[i].customImg
                    }

                    // add them to the div we created before
                    newDiv.appendChild(spanTag);
                    newDiv.appendChild(spanName);
                    newDiv.appendChild(spanChar);

                    // now for the character image, this is the mask/mirror div
                    const charImgBox = document.createElement("div");
                    charImgBox.className = "pfCharImgBox";

                    // actual image
                    const charImg = document.createElement('img');
                    charImg.className = "pfCharImg";
                    const charJson = await getJson(`${stPath.char}/${preset.characters[i].character}/_Info`);
                    // we will store this for later
                    skinImgs.push({
                        el : charImg,
                        charJson : charJson,
                        char : preset.characters[i].character,
                        skin : preset.characters[i].skin,
                        hex : preset.characters[i].hex,
                        customImg : preset.characters[i].customImg,
                    });
                    // we have to position it
                    this.positionCharImg(preset.characters[i].skin, charImg, charJson);
                    // and add it to the mask
                    charImgBox.appendChild(charImg);

                    //add it to the main div
                    newDiv.appendChild(charImgBox);

                    // before we go, add a click listener
                    newDiv.addEventListener("click", () => {
                        this.#entryClick(pData, player)
                    });

                    //and now add the div to the actual interface
                    this.addEntry(newDiv);

                    // we need this to know which cycle we're in
                    this.#presName = player.getName();

                }

            }

        }

        return skinImgs;
    }

    /** Loads character images for each finder entry */
    async loadFinderImgs(skinImgs) {

        // now lets add those images to each entry
        const currentPresName = this.#presName;
        for (let i = 0; i < skinImgs.length; i++) {

            // if the list isnt being shown, break the cycle
            if (this.#presName != currentPresName || !this.isVisible()) {
                break;
            }

            let skin;
            if (skinImgs[i].charJson) { // if a character is found
                for (let j = 0; j < skinImgs[i].charJson.skinList.length; j++) {

                    // cicle through the skin list to find the one
                    if (skinImgs[i].charJson.skinList[j].name == skinImgs[i].skin) {

                        // clone to not modify original
                        skin = structuredClone(skinImgs[i].charJson.skinList[j]);

                        // if we got a custom skin
                        if (skinImgs[i].customImg) {

                            // add in custom data
                            skin.hex = skinImgs[i].hex;
                            skin.force = true;

                        }

                        // we dont need to look for more
                        break;

                    }
                }
            } else {
                skin = {name: skinImgs[i].skin}
            }
            
            let finalColorData = null;
            if (skinImgs[i].charJson) {
                finalColorData = skinImgs[i].charJson.colorData;
            }

            console.log(skin);
            const finalSrc = await getRecolorImage(
                null,
                skinImgs[i].char,
                skin,
                finalColorData,
                "Skins",
                "P2"
            );
            skinImgs[i].el.setAttribute('src', finalSrc);

        }

    }

    /**
     * Updates a player with the data stored on the list's entry
     * @param {Object} pData - Data to be added to the player
     * @param {Player} player - Player to be updated
     */
    async #entryClick(pData, player) {

        // reset current focus
        current.focus = -1;

        // all them player data
        player.setName(pData.name);
        player.setTag(pData.tag);
        player.pronouns = pData.pronouns;
        player.twitter = pData.twitter;
        player.twitch = pData.twitch;
        player.yt = pData.yt;

        // character change
        await player.charChange(pData.char, true);
        if (pData.customImg) {
            setCurrentPlayer(player);
            customChange(pData.hex, pData.skin);
        } else { // search for all skins for name matches
            player.skinChange(player.findSkin(pData.skin));
        }

        // and hide the finder of course
        this.hide();

    }

}

export const playerFinder = new PlayerFinder;