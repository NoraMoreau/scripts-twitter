document.addEventListener("DOMContentLoaded", () => {
    async function majBouton() {
        let etatBouton = browser.storage.local.get("activeBoutonSuppression");
        console.log(etatBouton.activeBoutonSuppression[1])
	    if (etatBouton.activeBoutonSuppression) {
            console.log("Etat du bouton : ", etatBouton.activeBoutonSuppression);
		    let boutonActif = document.querySelector('[class="activeBouton"]');
		    boutonActif.classList.add("activeBouton");
	    }
    }

    async function lancerScriptSupp() {
        majBouton();
        let key = await browser.storage.local.get("pseudo");
        let url_profil = "https://x.com/" + key.pseudo;
        console.log(url_profil);

        //On écoute les clicks des boutons pour mancer la suppression
        let boutons_suppression = document.querySelectorAll('[class="bouton_lancer_suppression"]');
        boutons_suppression.forEach(bouton => {
            bouton.addEventListener("click", async () => {
                //On vérifie qu'on est bien sur l'url du profil personnel de l'utilisateur
                let tab_active = await browser.tabs.query({ active: true, currentWindow: true });
                if(tab_active[0].url == url_profil) {

                    //On vérifie sur quel bouton on clique
                    if(bouton.closest('.suppression_filtree')) {
                        let dateDebut = document.querySelector('.date_debut').value || null;
                        let dateFin = document.querySelector('.date_fin').value || null;
                        let pseudo = document.querySelector('.pseudo').value || null;
                        await browser.storage.local.set({ dateDebut, dateFin, pseudo });

                        //Il nous faut au moins un des arguments pour lancer ce bouton
                        if(dateDebut != null || dateFin != null || pseudo != null) {
                            //Le bouton change de couleur et le script de suppression peut être lancé
                            bouton.classList.add("activeBouton");
                            browser.storage.local.set({ activeBoutonSuppression: bouton.classList });
                            console.log("Bouton liste : ", bouton.classList)
                            /*await browser.scripting.executeScript({ 
                                target: { tabId: tab_active[0].id },
                                files: ["script_supptweet.js"] 
                            });*/
                        }
                    } else if (bouton.closest('.suppression_totale')) {
                        //Le bouton change de couleur et le script de suppression peut être lancé
                        bouton.classList.add("activeBouton");
                        browser.storage.local.set({ activeBoutonSuppression: bouton.classList });
                        console.log("Bouton liste : ", bouton.classList)
                        /*await browser.scripting.executeScript({ 
                            target: { tabId: tab_active[0].id },
                            files: ["script_supptweet.js"] 
                        });*/
                    }
                } else {
                    console.error("On n'est pas sur le profil de l'utilisateur");
                }
            });
        });
        console.log("Shana est raciste");
    }

    lancerScriptSupp();
});