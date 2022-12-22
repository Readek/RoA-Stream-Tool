import { Finder } from "./Finder.mjs";


class SkinFinder extends Finder {

    constructor() {
        super(document.getElementById("skinFinder"));
    }

}

export const skinFinder = new SkinFinder;