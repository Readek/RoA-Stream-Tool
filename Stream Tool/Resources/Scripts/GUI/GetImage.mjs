const fs = require('fs');

import { getRoARecolor } from './RoA WebGL Shader.mjs';
import * as glob from './Globals.mjs';

/**
 * @typedef {Object} Skin
 * @property {String} code - The skin color code to be used
 * @property {Boolean} blend - Makes the image have "Early Access" shading
 * @property {Array} alpha - Set the transparency for each part (for example: [1, 0.75, 0.5, 1])
 * @property {Boolean} golden - Adds golden shading to the character's black pixels
*/

/**
 * Returns a regular src path if an image with the skin name exists.
 * Returns a recolored image src if skin data for it exists.
 * Returns the default skin image if skin data or image file can't be found.
 * Returns the random image if a default skin image can't be found.
 * @param {String} char - Character name
 * @param {Skin} skin - Skin data
 * @param {String} jPath - Path to local file
 * @returns {String} - Image src
*/
export async function getRecolorImage(char, skin, colIn, colRan, extraPath, failPath) {

    if (fs.existsSync(`${glob.path.char}/${char}/${extraPath}${skin.name}.png`) && !skin.force) {

        return `${glob.path.char}/${char}/${extraPath}${skin.name}.png`;

    } else if (fs.existsSync(`${glob.path.char}/${char}/${extraPath}Default.png`)) {

        if (skin.hex) {
            return getRoARecolor(
                char,
                `${glob.path.char}/${char}/${extraPath}Default.png`,
                colIn,
                colRan,
                skin
            );
        } else {
            return `${glob.path.char}/${char}/${extraPath}Default.png`;
        }

    } else {
        return `${glob.path.charRandom}/${failPath}.png`;
    }

}

/**
 * Returns a monocolor image src preserving alpha of the requested character+skin.
 * If an image can't be found, it returns a 1x1 transparent pixer src.
 * @param {String} char Character name
 * @param {Skin} skin - Skin data
 * @param {String} color - Desired out color
 * @returns {String} - Image src
 */
export async function getTrailImage(char, skin, color) {

    // we add "FFFFFF" to the color to avoid shader issues when using only 1 color
    color += "FFFFFF";

    if (fs.existsSync(`${glob.path.char}/${char}/Skins/${skin}.png`)) {

        // if the requested skin exists as a separate image
        return getRoARecolor(
            "Trail",
            `${glob.path.char}/${char}/Skins/${skin}.png`,
            [127, 127, 127, 1, 0,0,0,0], // any color would do
            [360, 100, 100, 1, 0,0,0,0], // range picks up all colors
            {hex : color, ea : true}, // with blend true, only 1 color will be applied to everything
        )

    } else if (fs.existsSync(`${glob.path.char}/${char}/Skins/Default.png`)) {

        // else, use the default skin image
        return getRoARecolor(
            "Trail",
            `${glob.path.char}/${char}/Skins/Default.png`,
            [127, 127, 127, 1, 0,0,0,0],
            [360, 100, 100, 1, 0,0,0,0],
            {hex : color, ea : true},
        )

    } else {

        // if an image can't be found, return a 1x1 transparent pixel
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

    }

}