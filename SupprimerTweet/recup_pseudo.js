function recupPseudo() {
    let data_testid = document.querySelector('[data-testid^="UserAvatar-Container-"]');
    if(data_testid){
        let data_testid_attribut = data_testid.getAttribute("data-testid");
        let pseudo = data_testid_attribut.replace("UserAvatar-Container-", "");
        console.log("CONTENT_SCRIPT éxécuté, pseudo récupéré : ", pseudo);
        browser.storage.local.set({ pseudo });
        return true;
    }
    return false;
}

// On observe le DOM jusqu'à trouver le pseudo
if (!recupPseudo()) {
    let observer = new MutationObserver(() => {
        if (recupPseudo()) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

browser.storage.local.set({ activeBoutonSuppression: null });
browser.storage.local.set({dateDebutFiltre: null, dateFinFiltre: null, pseudoFiltre: null});