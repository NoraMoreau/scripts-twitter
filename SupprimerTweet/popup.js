document.addEventListener("DOMContentLoaded", () => {

    /***************************************************************************/
    /***** GARDE LA COULEUR DU BOUTON TANT QUE LA SUPPRESSION EST EN COURS *****/
    /***************************************************************************/
    async function maintientBoutonEnfonce() {
        let etatBouton = await browser.storage.local.get("activeBoutonSuppression");
	    if (etatBouton.activeBoutonSuppression == "activeBoutonSuppressionFiltree") {
            let boutonActif = document.querySelector('[class="suppression_filtree"] [class="bouton_lancer_suppression"]');
            boutonActif.classList.add("activeBouton");
            console.log("BOUTON MAINTENU : ", boutonActif);
	    } else if (etatBouton.activeBoutonSuppression == "activeBoutonSuppressionTotale") {
            let boutonActif = document.querySelector('[class="suppression_totale"] [class="bouton_lancer_suppression"]');
            boutonActif.classList.add("activeBouton");
            console.log("BOUTON MAINTENU : ", boutonActif);
        }
    }

    /*************************************************************************/
    /***** DESACTIVE LA COULEUR DU BOUTON QUAND LA SUPPRESSION EST FINIE *****/
    /*************************************************************************/
    function desactiveBouton(bouton) {
        browser.storage.onChanged.addListener((changes, area) => {
            if (area === "local" && changes.activeBoutonSuppression) {
                if (changes.activeBoutonSuppression.newValue === null) {
                    bouton.classList.remove("activeBouton");
                }
            }
        });
    }

    /**************************************************************/
    /***** ON LANCE LE SCRIPT DE SUPPRESSION AVEC LES FILTRES *****/
    /**************************************************************/
    async function lanceSuppressionFiltree(bouton, tab_active) {
        let dateDebutFiltre = document.querySelector('.date_debut').value || null;
        let dateFinFiltre = document.querySelector('.date_fin').value || null;
        let pseudoFiltre = document.querySelector('.pseudo').value || null;
        await browser.storage.local.set({ dateDebutFiltre, dateFinFiltre, pseudoFiltre });

        //Il nous faut au moins un des arguments pour lancer ce bouton
        if(dateDebutFiltre != null || dateFinFiltre != null || pseudoFiltre != null) {
            //Le bouton change de couleur et le script de suppression peut être lancé
            bouton.classList.add("activeBouton");
            browser.storage.local.set({ activeBoutonSuppression: "activeBoutonSuppressionFiltree" });
            await browser.scripting.executeScript({ 
                target: { tabId: tab_active[0].id },
                files: ["script_supptweet.js"] 
            });
        }
    }

    /*****************************************************************/
    /***** ON LANCE LE SCRIPT DE SUPPRESSION SUR TOUS LES TWEETS *****/
    /*****************************************************************/
    async function lanceSuppressionTotale(bouton, tab_active) {
        //Le bouton change de couleur et le script de suppression peut être lancé
        bouton.classList.add("activeBouton");
        browser.storage.local.set({ activeBoutonSuppression: "activeBoutonSuppressionTotale" });
        console.log("Le bouton est activé");
        await browser.scripting.executeScript({ 
            target: { tabId: tab_active[0].id },
            files: ["script_supptweet.js"] 
        });
        
    }

    /*************************************************************/
    /***** ON ARRÊTE LES SCRIPTS DE SUPPRESSION MANUELLEMENT *****/
    /*************************************************************/
    async function arretSuppression(bouton) {
        browser.storage.local.set({ activeBoutonSuppression: null });
        desactiveBouton(bouton);
        console.log("On désactive le bouton");
        
    }

    /***************************************************************************/
    /***** LANCE LE SCRIPT DE SUPRESSION EN DETECTANT LES BOUTONS ACTIVES *****/
    /***************************************************************************/
    async function lancerScriptSupp() {
        //Maintient le bouton enfoncé si la variable activeBoutonSuppression n'est pas nulle
        await maintientBoutonEnfonce();
        let { pseudo } = await browser.storage.local.get("pseudo");
        let url_profil = "https://x.com/" + pseudo;
        console.log(url_profil);

        //On écoute les clicks des boutons pour lancer la suppression
        let boutons_suppression = document.querySelectorAll('[class="bouton_lancer_suppression"]');
        boutons_suppression.forEach(bouton => {
            bouton.addEventListener("click", async () => {
                
                //On vérifie qu'on est bien sur l'url du profil personnel de l'utilisateur
                let tab_active = await browser.tabs.query({ active: true, currentWindow: true });
                if(tab_active[0].url == url_profil) {
                    
                    //On vérifie sur quel bouton on clique
                    if(bouton.closest('.suppression_filtree')) {
                        let { activeBoutonSuppression } = await browser.storage.local.get("activeBoutonSuppression");
                        console.log("ETAT DU BOUTON : ", activeBoutonSuppression);
                        
                        //L'arrêt de la suppression a été provoquée
                        if(activeBoutonSuppression) {
                            arretSuppression(bouton)
                        //On lance la suppression si le bouton n'a pas encore été activé
                        } else {
                            lanceSuppressionFiltree(bouton, tab_active);
                        }
                    } else if (bouton.closest('.suppression_totale')) {
                        let { activeBoutonSuppression } = await browser.storage.local.get("activeBoutonSuppression");
                        console.log("ETAT DU BOUTON : ", activeBoutonSuppression);

                        //L'arrêt de la suppression a été provoquée
                        if(activeBoutonSuppression) {
                            arretSuppression(bouton)
                        //On lance la suppression si le bouton n'a pas encore été activé
                        } else {
                            lanceSuppressionTotale(bouton, tab_active);
                        }
                    }
                } else {
                    console.error("On n'est pas sur le profil de l'utilisateur");
                }

            });

            //La suppression s'est finie naturellement on désactive le bouton visuellement, 
            desactiveBouton(bouton);
        });
    }

    lancerScriptSupp();
});