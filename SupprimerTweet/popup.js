document.addEventListener("DOMContentLoaded", () => {
    async function lancerScriptSupp() {
        let key = await browser.storage.local.get("pseudo");
        let url_profil = "https://x.com/" + key.pseudo;
        console.log(url_profil);

        const bouton_suppression = document.querySelector('[class="bouton_lancer_suppression"]');
        bouton_suppression.addEventListener("click", async () => {
            let tab_active = await browser.tabs.query({ active: true, currentWindow: true });
            if(tab_active[0].url == url_profil) {
                await browser.scripting.executeScript({ 
                    target: { tabId: tab_active[0].id },
                    files: ["script_supptweet.js"] 
                });
            } else {
                console.error("On n'est pas sur le profil de l'utilisateur");
            }
        });
    }

    lancerScriptSupp();
});