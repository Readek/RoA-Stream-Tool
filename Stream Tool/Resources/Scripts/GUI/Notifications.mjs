const notifSpan = document.getElementById("notifText");

/**
 * Displays a notification on screen
 * @param {String} text - Text to be shown
 */
export function displayNotif(text) {
    
    notifSpan.innerHTML = text;

    notifSpan.style.animation = "";
    setTimeout(() => {
        notifSpan.style.animation = "notifAnim 2.5s both";
    });

}
