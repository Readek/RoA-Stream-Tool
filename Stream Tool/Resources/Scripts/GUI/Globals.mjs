/** these are set when their respective views are visible */
export const inside = {
    settings : false,
    bracket : false,
    finder : false,
    electron : typeof process !== 'undefined' // if in executable or remote gui
};

/** Paths used for all of the Stream Tool */
const realPath = inside.electron ? __dirname : ""; // local file path if in executable
export const stPath = {
    char : "",
    charRandom : realPath + '/Characters/Random',
    charBase : realPath + '/Characters',
    charWork : realPath + '/Characters/_Workshop',
    overlay: realPath + '/Overlay',
    text : realPath + '/Texts',
    scripts: realPath + '/Scripts'
};

/** Current values for stuff */
export const current = {
    focus : -1
}
