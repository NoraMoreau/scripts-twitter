(() => {

let pseudo = document.querySelector('[data-testid="UserName"] [tabindex="-1"]').innerText;
console.log("Pseudo ", pseudo);

function estEpingle(tweet) {
	let socialContext = tweet.querySelector('[data-testid="socialContext"]');
	return socialContext && socialContext.innerText == "Épinglé" ? true : false;
}

function estRetweet(tweet) {
	let socialContext = tweet.querySelector('[data-testid="socialContext"]');
	return socialContext && socialContext.innerText == "Vous avez reposté" ? true : false;
}

function estMonTweet(tweet) {
	return tweet.querySelector('[data-testid="User-Name"] [tabindex="-1"]').innerText == pseudo ? true : false;
}

async function scrollBoucle() {
	let debut = Date.now();
	while(Date.now() - debut < 5000){
		//On cible les tweets de primaryColumn, pour trier les éléments parasites
		let tweet = document.querySelector('[data-testid="primaryColumn"] [data-testid="tweet"]');
		//Si un tweet est dispo afficher
		if(tweet) {
			//Si c'est l'épinglé ne pas le toucher
			if(estEpingle(tweet)) {
				console.log("Ne pas toucher l épinglé");

			//Si c'est un retweet annuler le retweet
			} else if(estRetweet(tweet)) {
				console.log("C'est un retweet");

			//Si c'est un tweet à moi supprimer avec les trois petits points
			} else if(estMonTweet(tweet)) {
				console.log(tweet.querySelector('[data-testid="tweetText"]').innerText); //si texte bon, si photo erreur
				let bouton = tweet.querySelector('[type="button"], [data-testid="caret"]');

			//Un truc imprévu
			} else {
				console.log("IL Y A QUELQUE CHOSE");
				console.log(tweet);
			}
		}
		window.scrollBy(0, window.innerHeight*0.9);
		await new Promise(r => setTimeout(r, 100));
	}
}

scrollBoucle();

})();


async function suppTweet() { 
	var tweet = document.querySelector('[data-testid="primaryColumn"] [data-testid="tweet"]');
	console.log(tweet.querySelector('[data-testid="User-Name"] [tabindex="-1"]').innerText);
	tweet.querySelector('[type="button"], [data-testid="caret"]').click();

	await new Promise(r => setTimeout(r, 200)); //le temps que le menu apparaît

	var menuDeroulantTweet = document.querySelector('[data-testid="Dropdown"]');
	var suppBouton = menuDeroulantTweet.querySelector('[role="menuitem"] span');
	console.log(suppBouton.innerText);
	suppBouton.click();

	await new Promise(r => setTimeout(r, 200)); //le temps que la fenêtre de confirmation apparaisse

	var menuConfirmationSuppresion = document.querySelector('[data-testid="confirmationSheetDialog"]');
	var confirmationSuppBouton = menuConfirmationSuppresion.querySelector('[data-testid="confirmationSheetConfirm"]');
	console.log(confirmationSuppBouton.innerText);

}

suppTweet();


async function annuleRetweet() {

}

annuleRetweet();


