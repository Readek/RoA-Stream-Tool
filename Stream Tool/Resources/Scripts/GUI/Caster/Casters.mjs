import { Caster } from "./Caster.mjs";

const addCasterButt = document.getElementById("addCasterButt");
const casterDiv = document.getElementById("casterDiv");

/** @type {Caster[]} */
export const casters = [];

let idCounter = 1;

addCasterButt.addEventListener("click", addCaster);

/** Adds a new commentator (unless theres too many) */
export function addCaster() {
    if (casters.length < 9) {
        casters.push(new Caster(idCounter));
        casterDiv.appendChild(addCasterButt);
        idCounter++;
        if (casters.length == 9) {
            addCasterButt.disabled = true;
        } else {
            addCasterButt.disabled = false;
        }
    }
}

/**
 * Removes a commentator for the array
 * @param {Number} id - Caster identifier
 */
export function deletCaster(id) {
    for (let i = 0; i < casters.length; i++) {
        if (casters[i].getId() == id) {
            casters.splice(i, 1);
        }        
    }
    addCasterButt.disabled = false;
}