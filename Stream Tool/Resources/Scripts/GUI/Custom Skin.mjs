import { Player } from "./Player/Player.mjs";
import { viewport } from "./Viewport.mjs";

// set listeners for the custom skins menu
document.getElementById("customSkinBackButt").addEventListener("click", hideCustomSkin);
document.getElementById("customSkinApplyButt").addEventListener("click", () => {customChange()});

// prrrrreload, its more efficient!
const customSkinDiv = document.getElementById("customSkinDiv");
const codeInput = document.getElementById("customSkinInput");
const charSpan = document.getElementById("customSkinCharSpan");
const customSkinSelect = document.getElementById("customSkinSelect");

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

    // update the custom skin select
    updateCustomSelect();

    // resize select
    resizeCustomSelect();

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

/** Updates the custom skin dropdown with current character data */
function updateCustomSelect() {

    // clear current data
    customSkinSelect.innerHTML = "";

    // add new entries
    addCustomEntry("Default");

    // for each skin that has a different recolorable image
    const skinList = curPlayer.charInfo.skinList;
    for (let i = 0; i < skinList.length; i++) {
        if (skinList[i].force && skinList[i].name != "Default") {
            addCustomEntry(skinList[i].name);
        }
    }

    if (customSkinSelect.length <= 1) {
        customSkinSelect.style.display = "none";
    } else {
        customSkinSelect.style.display = "block";
    }

}

/**
 * Adds a new value to the custom skin select
 * @param {String} text - Entry text
 */
function addCustomEntry(text) {
    const entry = document.createElement("option");
    entry.text = text;
    entry.value = text;
    customSkinSelect.add(entry);
}

/**
 * Reads the color code input to change the skin of a player
 * @param {String} hex - Optional color code forcing
 * @param {String} skinName - Optional custom img forcing
 */
export async function customChange(hex, skinName) {

    // grab the original skin's values and change them up
    const skin = structuredClone(curPlayer.findSkin(skinName || customSkinSelect.value));
    skin.name = skinName || customSkinSelect.value;
    skin.hex = hex || codeInput.value;
    skin.customImg = true;
    skin.force = true;
    
    // aaaaand change it
    await curPlayer.skinChange(skin);

    // we no longer want to see this menu
    hideCustomSkin();

}

/**
 * Sets the current player to add a custom skin to
 * @param {Player} player - Player to use
 */
export function setCurrentPlayer(player) {
    curPlayer = player;
}

customSkinSelect.addEventListener("change", () => {resizeCustomSelect()});
/** Determines the width of only the current selected value */
function resizeCustomSelect() {
    const tempOption = document.createElement('option');
    tempOption.textContent = customSkinSelect.value;

    const tempSelect = document.createElement('select');
    tempSelect.style.visibility = "hidden";
    tempSelect.style.position = "fixed"
    tempSelect.appendChild(tempOption);
    
    customSkinSelect.after(tempSelect);
    customSkinSelect.style.width = `${+tempSelect.clientWidth + 12}px`;
    tempSelect.remove();
}