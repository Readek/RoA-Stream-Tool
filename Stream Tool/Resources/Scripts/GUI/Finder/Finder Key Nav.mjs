import * as glob from '../Globals.mjs';

/**
 * Adds visual feedback to navigate finder lists with the keyboard
 * @param {HTMLCollectionOf} x - Finder elements list
 * @param {Boolean} direction - Up or down
 */
export function addActive(x, direction) {
    
    removeActiveClass(x);

    // if true, were going up
    if (direction) {

        // increase that focus
        glob.current.focus++;
        // if end of list, cicle
        if (glob.current.focus >= x.length) glob.current.focus = 0;

        // search for the next visible entry
        while (glob.current.focus <= x.length-1) {
            if (x[glob.current.focus].style.display == "none") {
                glob.current.focus++;
            } else {
                break;
            }
        }
        // if we didnt find any, start from 0
        if (glob.current.focus == x.length) {
            glob.current.focus = 0;
            while (glob.current.focus <= x.length-1) {
                if (x[glob.current.focus].style.display == "none") {
                    glob.current.focus++;
                } else {
                    break;
                }
            }
        }
        // if even then we couldnt find a visible entry, set it to invalid
        if (glob.current.focus == x.length) {
            glob.current.focus = -1;
        }

    } else { // same as above but inverted
        glob.current.focus--;
        if (glob.current.focus < 0) glob.current.focus = (x.length - 1);
        while (glob.current.focus > -1) {
            if (x[glob.current.focus].style.display == "none") {
                glob.current.focus--;
            } else {
                break;
            }
        }
        if (glob.current.focus == -1) {
            glob.current.focus = x.length-1;
            while (glob.current.focus > -1) {
                if (x[glob.current.focus].style.display == "none") {
                    glob.current.focus--;
                } else {
                    break;
                }
            }
        }
        if (glob.current.focus == x.length) {
            glob.current.focus = -1;
        }
    }

    // if there is a valid entry
    if (glob.current.focus > -1) {
        //add to the selected entry the active class
        x[glob.current.focus].classList.add("finderEntry-active");
        // make it scroll if it goes out of view
        x[glob.current.focus].scrollIntoView({block: "center"});
    }
    
}

/**
 * Removes visual feedback from a finder lists
 * @param {HTMLCollectionOf} x - Finder elements list
 */
export function removeActiveClass(x) {
    //clears active from all entries
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("finderEntry-active");
    }
}