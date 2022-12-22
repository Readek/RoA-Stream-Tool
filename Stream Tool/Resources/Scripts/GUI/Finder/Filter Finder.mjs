import * as glob from '../Globals.mjs';
import { addActive, removeActiveClass } from './Finder Key Nav.mjs';

/**
 * Filters the finder's content depending on input text
 * @param {HTMLElement} finder - Finder to filter
*/ 
export function filterFinder(finder) {

    // we want to store the first entry starting with filter value
    let startsWith;

    // get the current text
    const filterValue = finder.getElementsByClassName("listSearch")[0].value;

    // for every entry on the list
    const finderEntries = finder.getElementsByClassName("searchList")[0].children;
    for (let i = 0; i < finderEntries.length; i++) {
        
        // find the name we are looking for
        const entryName = finderEntries[i].getElementsByClassName("pfName")[0].innerHTML;

        // if the name doesnt include the filter value, hide it
        if (entryName.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())) {
            finderEntries[i].style.display = "flex";
        } else {
            finderEntries[i].style.display = "none";
        }

        // if its starts with the value, store its position
        if (entryName.toLocaleLowerCase().startsWith(filterValue.toLocaleLowerCase()) && !startsWith) {
            startsWith = i;
        }

    }

    glob.current.focus = -1;

    // if no value, just remove any remaining active classes
    if (filterValue == "") {
        removeActiveClass(finder.getElementsByClassName("finderEntry"));
    } else {
        if (startsWith) glob.current.focus = startsWith - 1;
        addActive(finder.getElementsByClassName("finderEntry"), true);
    }

}