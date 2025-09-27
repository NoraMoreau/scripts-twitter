document.addEventListener("DOMContentLoaded", () => {
    const bouton_suppression = document.querySelector('[class="bouton_lancer_suppression"]');
    bouton_suppression.addEventListener("click", () => {
        console.log("On a cliqué sur supprimer");
    });
});