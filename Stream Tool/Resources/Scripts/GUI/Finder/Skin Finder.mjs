import { FinderSelect } from "./Finder Select.mjs";


class SkinFinder extends FinderSelect {

    constructor() {
        super(document.getElementById("skinFinder"));
    }

}

export const skinFinder = new SkinFinder;