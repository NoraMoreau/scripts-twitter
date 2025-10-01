(() => {

async function boutonDesactive() {
	let etatBouton = await browser.storage.local.get("activeBoutonSuppression");

	if (etatBouton.activeBoutonSuppression) {
		let boutonActif = document.querySelector('[class="activeBouton"]');
		boutonActif.classList.remove("activeBouton");
	}
}

/***********************************************/
/*** APPARITION D'UN ELEMENT DANS LA FENETRE ***/
/***********************************************/
function apparitionElement(selecteur, delai = 5000) {
	return new Promise((resolue, rejetee) => {
		let debut = Date.now();
		let sablier = setInterval(() => {
			if(document.querySelector(selecteur)) {
				clearInterval(sablier);
				resolue(document.querySelector(selecteur));

			} else if (Date.now() - debut > delai) {
				clearInterval(sablier);
				rejetee();
			}
		}, 100);
	});
}

/************************************************/
/*** DISPARITION D'UN ELEMENT DANS LA FENETRE ***/
/***********************************************/
function disparitionElement(selecteur, tweet, delai = 5000) {
	return new Promise((resolue, rejetee) => {
		let debut = Date.now();
		let sablier = setInterval(() => {
			if(!document.querySelector(selecteur)) {
				clearInterval(sablier);
				resolue();

			} else if (Date.now() - debut > delai) {
				clearInterval(sablier);
				console.error("Le tweet n'a pas été supprimé de la page");
				console.error(tweet);
				rejetee();
			}
		}, 100);
	});
}


/************************************/
/*** SUPPRESSION D'UN TWEET A SOI ***/
/************************************/
async function suppTweet(tweet) { 
	//Appuie sur les 3 petits points du tweet
	tweet.querySelector('[data-testid="caret"]').click();

	//Vérifie que le manu apparaisse bien après le click sur les ...
	//Appuie sur supprimer dans le menu déroulant,
	try {
		let menuDeroulantTweet = await apparitionElement('[data-testid="Dropdown"]');
		let spans = menuDeroulantTweet.querySelectorAll('[role="menuitem"] span')
		let suppBouton = Array.from(spans).find(s => s.innerText.trim() == "Supprimer");
		suppBouton.click();
	} catch {
		console.error("PROBLEME <Menu deroulant info tweet> : promesse d'apparition d'élèment rejetee, attente trop longue");
	}

	//Verifie que la fenêtre de confirmation de suppression apparaisse bien après le click sur supprimer
	//Appuie sur supprimer dans la fenêtre de confirmation de suppression, 
	try {
		let menuConfirmationSuppresion = await apparitionElement('[data-testid="confirmationSheetDialog"]');
		let confirmationSuppBouton = menuConfirmationSuppresion.querySelector('[data-testid="confirmationSheetConfirm"]');
		confirmationSuppBouton.click();
		await disparitionElement('[data-testid="confirmationSheetConfirm"]', tweet);
	} catch {
		console.error("PROBLEME <Menu confirmation suppresion tweet> : promesse d'apparition d'élèment rejetee, attente trop longue");
	}
}


/************************************/
/******** ANNULER UN RETWEET ********/
/************************************/
async function annulRetweet(tweet) {
	//Appuie sur l'icone unretweet
	tweet.querySelector('[data-testid="unretweet"]').click();

	//Verifie que la fenêtre de unretweet apparaisse bien après le click sur l'icone
	//Appuie sur le bouton annuler le retweet
	try {
		let menuIconeRetweet = await apparitionElement('[data-testid="Dropdown"]');
		let annulRetweetBouton = menuIconeRetweet.querySelector('[data-testid="unretweetConfirm"]');
		annulRetweetBouton.click();
		await disparitionElement('[data-testid="unretweetConfirm"]', tweet);
	} catch {
		console.error("PROBLEME <Menu deroulant unretweet> : promesse d'apparition d'élèment rejetee, attente trop longue");
	}
}


/*************************************/
/*** VERIFICATION DU TYPE DE TWEET ***/
/*************************************/
function estEpingle(tweet) {
	let socialContext = tweet.querySelector('[data-testid="socialContext"]');
	return socialContext && socialContext.innerText == "Épinglé" ? true : false;
}

function estRetweet(tweet) {
	let socialContext = tweet.querySelector('[data-testid="socialContext"]');
	return socialContext && socialContext.innerText == "Vous avez reposté" ? true : false;
}

function estMonTweet(tweet) {
	return tweet.querySelector('[data-testid="User-Name"] [tabindex="-1"]').innerText == monPseudo ? true : false;
}


/**************************************/
/*** RECUPERATION 1ER TWEET VISIBLE ***/
/**************************************/
/*Confort visuel pour les test, au lieu que ce soit le premier tweet du DOM, c'est le 1er qu'on voit*/
function premierTweetVisible() {
	//On cible les tweets de primaryColumn, pour trier les éléments parasites à gauche et à droite
	let tweets = document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="tweet"]');
	//On regarde le tweet qui se trouve en haut de l'écran visible, un peu après la barre du pseudo
	return Array.from(tweets).find(t => {
		let positionTweet = t.getBoundingClientRect();
		return positionTweet.top >=60
	});
}


/*************************************/
/***** BOUCLE QUI SCROLL LA PAGE *****/
/*************************************/
async function scrollBoucle() {
	let debut = Date.now();
	while(Date.now() - debut < 10000){

		//On récupère le premier tweet visible de la fenêtre
		let tweet = premierTweetVisible();

		//Si un tweet est dispo, le supp si c'est un tweet de soi, ou le unretweet si c'est un retweet
		if(tweet) {
			let pseudo = tweet.querySelector('[data-testid="User-Name"] [tabindex="-1"]').innerText;

			//Si c'est l'épinglé ne pas le toucher
			if(estEpingle(tweet)) {
				console.log("EPINGLE ", pseudo);
				window.scrollBy(0, window.innerHeight*0.9);

			//Si c'est un retweet annuler le retweet
			} else if(estRetweet(tweet)) {
				console.log("RETWEET ", pseudo);
				await annulRetweet(tweet);

			//Si c'est un tweet à moi supprimer avec les trois petits points
			} else if(estMonTweet(tweet)) {
				console.log("TWEET ", pseudo);
				await suppTweet(tweet);

			//Un truc imprévu
			} else {
				console.log("IL Y A QUELQUE CHOSE D'IMPREVUE");
				console.log(tweet);
				break;
			}
		} else {
			window.scrollBy(0, window.innerHeight*0.9);
		}

		await new Promise(tps => setTimeout(tps, 400));
	}

	boutonDesactive();
	console.log("FIN DU PROGRAMME");
}


/***************************************************/
/***************************************************/
/********************* LE MAIN *********************/
/***************************************************/
/***************************************************/
let monPseudo = "@" + window.location.pathname.split("/")[1];
console.log("SUPPRESSION TWEET DE ", monPseudo);
scrollBoucle();

})();