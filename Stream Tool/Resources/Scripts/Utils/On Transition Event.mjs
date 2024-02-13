/**
 * Starts an event listener fired every time browser becomes "active"
 * @param {() => {void}} hide - hideElements() function
 * @param {() => {void}} show - showElements() function
 */
export function initOnBrowserActive(hide, show) {

    // if browser is on OBS
    if (window.obsstudio) {
        
        // every time the browser source becomes active
        window.addEventListener('obsSourceActiveChanged', (event) => {

            if (event.detail.active) { // when its show time
                show();
            } else { // when browser goes to the backstage
                hide();
            }
        
        })

    } else {
        
        // this is here for regular browsers for better developer experiece
        // this will trigger every time the browser goes out of view (or back to view)
        document.addEventListener("visibilitychange", () => {

            if (document.hidden) { // if lights go out
                hide();
            } else { // when the user comes back
                show();
            }

        });

    }

}

/** Determines if the browser view is currently active/visible */
export function isBrowserActive() {
	
	if (window.obsstudio) {
		return true; // theres no way to get active state without the event listener :(
	} else {
		return document.visibilityState;
	}

}