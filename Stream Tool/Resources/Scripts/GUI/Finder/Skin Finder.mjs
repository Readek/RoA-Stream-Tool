import { FinderSelect } from "./Finder Select.mjs";
import { getRecolorImage } from '../GetImage.mjs';
import { showCustomSkin } from "../Custom Skin.mjs";

class SkinFinder extends FinderSelect {

    constructor() {
        super(document.getElementById("skinFinder"));
    }

    /**
     * Fills the skin finder with the player's current character's skins
     * @param {Player} player - Player that clicked on the skin selector
     */
    async fillSkinList(player) {

        const skinImgs = [];

        // clear the list
        this.clearList();

        // for every skin on the skin list, add an entry
        for (let i = 0; i < player.charInfo.skinList.length; i++) {
            
            // this will be the div to click
            const newDiv = document.createElement('div');
            newDiv.className = "finderEntry";
            newDiv.addEventListener("click", () => {
                player.skinChange(player.charInfo.skinList[i])
            });
            
            // character name
            const spanName = document.createElement('span');
            spanName.innerHTML = player.charInfo.skinList[i].name;
            spanName.className = "pfName";

            // add them to the div we created before
            newDiv.appendChild(spanName);

            // now for the character image, this is the mask/mirror div
            const charImgBox = document.createElement("div");
            charImgBox.className = "pfCharImgBox";

            // actual image
            const charImg = document.createElement('img');
            charImg.className = "pfCharImg";
            skinImgs.push(charImg);
            
            // we have to position it
            this.positionCharImg(
                player.charInfo.skinList[i].name,
                charImg,
                {gui: player.charInfo.gui}
            );
            // and add it to the mask
            charImgBox.appendChild(charImg);

            //add it to the main div
            newDiv.appendChild(charImgBox);

            // and now add the div to the actual GUI
            skinFinder.addEntry(newDiv);

        }

        // now add a final entry for custom skins
        const newDiv = document.createElement('div');
        newDiv.className = "finderEntry";
        newDiv.addEventListener("click", () => {showCustomSkin(player)});
        const spanName = document.createElement('span');
        spanName.innerHTML = "Custom Skin";
        spanName.className = "pfName";
        spanName.style.color = "lightsalmon"
        newDiv.appendChild(spanName);
        skinFinder.addEntry(newDiv);

        // add them images to each entry and recolor them if needed
        for (let i = 0; i < skinImgs.length; i++) {

            // if the skin list isnt being shown, break the cycle
            if (!skinFinder.isVisible()) {
                break;
            }
            // add the final image
            const finalSrc = await getRecolorImage(
                player.char,
                player.charInfo.skinList[i],
                player.charInfo.ogColor,
                player.charInfo.colorRange,
                "Skins",
                "P2"
            );
            skinImgs[i].setAttribute('src', finalSrc);
            
        }

    }

}

export const skinFinder = new SkinFinder;