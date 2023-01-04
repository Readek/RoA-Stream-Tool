const charImgs = document.getElementsByClassName("charImg");

/**
 * Updates the background character image behind the player's GUI
 * @param {Number} pNum - Player number that requested an update
 * @param {String} src - The image's src
 */
export function updateBgCharImg(pNum, src) {
    charImgs[pNum].src = src;
}

/** Displays character images behind the player's GUI */
export function showBgCharImgs() {
    for (let i = 0; i < charImgs.length; i++) {
        charImgs[i].style.display = "block";
    }
}

/** Hides character images behind the player's GUI */
export function hideBgCharImgs() {
    for (let i = 0; i < charImgs.length; i++) {
        charImgs[i].style.display = "none";
    }
}