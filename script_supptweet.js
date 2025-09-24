
function estEpingle(tweet) {
	let socialContext = tweet.querySelector('[data-testid="socialContext"]');
	return socialContext && socialContext.innerText == "Épinglé" ? true : false;
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
			} else {
				console.log(tweet.querySelector('[data-testid="tweetText"]').innerText); 
			}
		}
		window.scrollBy(0, window.innerHeight*0.9);
		await new Promise(r => setTimeout(r, 100));
	}
}

scrollBoucle();

