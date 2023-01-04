import { viewport } from "./Viewport.mjs";

// set listeners for the custom skins menu
document.getElementById("customSkinBackButt").addEventListener("click", hideCustomSkin);
document.getElementById("customSkinApplyButt").addEventListener("click", () => {customChange()});

// prrrrreload, its more efficient!
const customSkinDiv = document.getElementById("customSkinDiv");
const codeInput = document.getElementById("customSkinInput");
const charSpan = document.getElementById("customSkinCharSpan");

// reference to the active player
let curPlayer;


/**
 * Shows up the custom skin menu
 * @param {Player} player - Player that requested a custom color change
 */
export function showCustomSkin(player) {

    // store the current active player
    curPlayer = player;

    // clear the previous character code
    codeInput.value = "";

    // automatically focus on the code input
    codeInput.focus();

    // show us which character is this for
    charSpan.innerHTML = curPlayer.char;

    // show the custom color div
    customSkinDiv.style.pointerEvents = "auto";
    customSkinDiv.style.opacity = 1;
    customSkinDiv.style.transform = "scale(1)";
    viewport.opacity(".25");

}

/** Hides the custom skin menu */
function hideCustomSkin() {
    customSkinDiv.style.pointerEvents = "none";
    customSkinDiv.style.opacity = 0;
    customSkinDiv.style.transform = "scale(1.15)";
    viewport.opacity("1");
}

/**
 * Reads the color code input to change the skin of a player
 * @param {String} hex - Optional color code forcing
 */
export function customChange(hex) {

    // get the color code from input element
    let skinHex = codeInput.value;

    // but use a the sent color code if we have one
    if (hex) {
        skinHex = hex;
    }

    // skin data
    const skin = {
        name: "Custom",
        hex: skinHex
    };
    
    curPlayer.skinChange(skin);
    hideCustomSkin();

}

export function setCurrentPlayer(player) {
    curPlayer = player;
}