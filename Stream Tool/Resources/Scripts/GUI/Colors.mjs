import { stPath } from './Globals.mjs';
import { players } from './Player/Players.mjs';
import { getJson } from './File System.mjs';

export const currentColors = [];
const colorRectangles = document.getElementsByClassName("pColorRect");
const colorGradients = document.getElementsByClassName("side");

// load the color list from a json file
const colorList = await getJson(stPath.text + "/Color Slots");

// for each color on the list, add them to the color dropdown
for (let i = 0; i < colorList.length; i++) {

    // create a new div that will have the color info
    const newDiv = document.createElement('div');
    newDiv.title = "Also known as " + colorList[i].hex;
    newDiv.className = "colorEntry";

    // create the color's name
    const newText = document.createElement('div');
    newText.innerHTML = colorList[i].name;
    
    // create the color's rectangle
    const newRect = document.createElement('div');
    newRect.className = "colorInList";
    newRect.style.backgroundColor = colorList[i].hex;

    // add them to the div we created before
    newDiv.appendChild(newRect);
    newDiv.appendChild(newText);

    // now add them to the actual interface
    document.getElementById("dropdownColorL").appendChild(newDiv);

    // copy the div we just created to add it to the right side
    const newDivR = newDiv.cloneNode(true);
    document.getElementById("dropdownColorR").appendChild(newDivR);
    
    // if the divs get clicked, update the colors
    newDiv.addEventListener("click", () => {updateColor(0, colorList[i])});
    newDivR.addEventListener("click", () => {updateColor(1, colorList[i])});

}

/**
 * Updates the color of a team
 * @param {Number} side - Which side was clicked
 * @param {Object} color - Color data
 */
export async function updateColor(side, color) {

    // this will tell us when this function has finished
    const promises = [];

    currentColors[side] = color;

    // change both the color rectangle and the background gradient
    colorRectangles[side].style.backgroundColor = color.hex;
    colorGradients[side].style.backgroundImage = `linear-gradient(to bottom left, ${color.hex}50, #00000000, #00000000)`;

    // generate new trails for existing characters
    for (let i = 0; i < players.length; i+=2) {
        if (side % 2 == 0) {
            promises.push(players[i].setTrailImage());
        } else {
            promises.push(players[i+1].setTrailImage());
        }
    }

    // remove focus from the menu so it hides on click
    document.activeElement.blur();

    await Promise.all(promises);
    return;

}

initColors();
/** set the initial colors for the interface (the first color for p1, and the second for p2) */
function initColors() {
    currentColors[0] = colorList[0];
    currentColors[1] = colorList[1];
    // change both the color rectangle and the background gradient
    colorRectangles[0].style.backgroundColor = colorList[0].hex;
    colorGradients[0].style.backgroundImage = `linear-gradient(to bottom left, ${colorList[0].hex}50, #00000000, #00000000)`;
    colorRectangles[1].style.backgroundColor = colorList[1].hex;
    colorGradients[1].style.backgroundImage = `linear-gradient(to bottom left, ${colorList[1].hex}50, #00000000, #00000000)`;
}
