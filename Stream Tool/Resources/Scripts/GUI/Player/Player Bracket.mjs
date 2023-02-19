import { Player } from "./Player.mjs";

export class PlayerBracket extends Player {

    tagInp;
    charDiv;
    iconBrowserSrc;
    scoreInp;

    constructor(id) {

        super(id);

        this.charDiv = this.createCharSelects();

    }

    getName() {
        return this.nameInp.value;
    }
    setName(name) {
        this.nameInp.value = name == "-" ? "" : name;
    }
    getTag() {
        return this.tagInp.value;
    }
    setTag(tag) {
        this.tagInp.value = tag;
    }
    getScore() {
        return this.scoreInp.value;
    }
    setScore(score) {
        this.scoreInp.value = score == "-" ? "" : score;
    }


    /** Creates the charSel and skinSel div elements */
    createCharSelects() {

        // main div
        const charDiv = document.createElement('div');
        charDiv.className = "charSelects";

        // for the character list
        const cFinderPositionDiv = document.createElement('div');
        cFinderPositionDiv.className = "finderPosition";
        charDiv.appendChild(cFinderPositionDiv);

        // actual character button
        const charSelectorDiv = document.createElement('div');
        charSelectorDiv.className = "selector charSelector bCharSelector";
        charSelectorDiv.setAttribute("tabindex", "-1");
        this.charSel = charSelectorDiv;
        cFinderPositionDiv.appendChild(charSelectorDiv);

        // character icon
        const charSelectorIconImg = document.createElement('img');
        charSelectorIconImg.className = "charSelectorIcon";
        charSelectorIconImg.setAttribute("alt", "");
        charSelectorDiv.appendChild(charSelectorIconImg);

        // character text
        const charSelectorTextDiv = document.createElement('div');
        charSelectorTextDiv.className = "charSelectorText";
        charSelectorDiv.appendChild(charSelectorTextDiv);

        // for the skin list
        const cFinderPositionSkinDiv = document.createElement('div');
        cFinderPositionSkinDiv.className = "finderPosition";
        charDiv.appendChild(cFinderPositionSkinDiv);

        // actual skin button
        const skinSelectorDiv = document.createElement('div');
        skinSelectorDiv.className = "selector skinSelector bSkinSelector";
        skinSelectorDiv.setAttribute("tabindex", "-1");
        this.skinSel = skinSelectorDiv;
        cFinderPositionSkinDiv.appendChild(skinSelectorDiv);

        return charDiv;

    }

    /**
     * Updates the character for this player
     * @param {String} character - Name of the character to update to
     * @param {Boolean} notDefault - Determines if we skinChange to the default skin
     */
    async charChange(character, notDefault) {
        if (character == "-" || character == "Random") {
            await super.charChange("None", notDefault);
        } else {
            await super.charChange(character, notDefault);
        }
    }

    /**
     * Updates the skin for this player
     * @param {Object} skin - Skin data
     */
    async skinChange(skin) {

        this.setReady(false);

        // remove focus from the skin list so it auto hides
        document.activeElement.blur();

        this.skin = skin;

        // update the text of the skin selector
        if (skin.customImg) {
            this.skinSel.innerHTML = "Custom " + skin.name;
        } else {
            this.skinSel.innerHTML = skin.name;
        }

        // check if an icon for this skin exists, recolor if not
        await this.setIconImg();

        // store custom data for remote gui shenanigans
        this.skinHex = skin.hex;
        this.customImg = skin.customImg;

        // notify the user that we done here
        this.setReady(true);

    }

}