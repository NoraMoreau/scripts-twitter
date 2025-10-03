(() => {


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

	//Vérifie que le menu apparaisse bien après le click sur les ...
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
	while(!tweet.querySelector('[data-testid="unretweet"]')) {
		window.scrollBy(0, window.innerHeight*0.2);
		await apparitionElement('[data-testid="unretweet"]', 300);
	}
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

/***************************************/
/***** RECUPERE LA DATE D'UN TWEET *****/
/***************************************/
async function dateTweet() {
	let tweet = premierTweetVisible();
	if(tweet) {
		let date = tweet.querySelector('time').getAttribute('datetime');
		return date.split('T')[0];
	}
}

/*********************************************************/
/***** CHERCHE UN TWEET CORRESPONDANT AU FILTRE DATE *****/
/*********************************************************/
async function chchTweetDansIntervalleDates(dateDebutFiltre, dateFinFiltre) {
	//On scroll tant qu'on n'a pas un tweet compris dans l'intervalle des dates
	while((dateDebutFiltre ? await dateTweet() < dateDebutFiltre : false) ||
	(dateFinFiltre   ? await dateTweet() > dateFinFiltre : false)) {
		//On vérifie que le bouton de suppression est bien activé, sinon on arrête de force la suppression
		let { activeBoutonSuppression } = await browser.storage.local.get("activeBoutonSuppression");
		if(!activeBoutonSuppression) {
			console.error("L'arrêt de la suppression a été forcé.");
			break;
		}

		window.scrollBy(0, window.innerHeight*0.9);
		await new Promise(tps => setTimeout(tps, 400));

		if(await finProfil()){
			cleanVariablesLocales();
			break;
		}
	}
}

/*********************************************************/
/***** VERIFIE SI ON SE TROUVE TOUT EN BAS DU PROFIL *****/
/*********************************************************/
async function finProfil() {
	let basPage = window.innerHeight + window.scrollY;
	let hauteurTotale = document.documentElement.scrollHeight;
	if(basPage >= hauteurTotale) {
		await new Promise(tps => setTimeout(tps, 400));
		return hauteurTotale == document.documentElement.scrollHeight;
	}
	return false;
}

/**************************************/
/***** VIDE LES VARIABLES LOCALES *****/
/**************************************/
async function cleanVariablesLocales() {
	await browser.storage.local.set({activeBoutonSuppression: null});
	await browser.storage.local.set({dateDebutFiltre: null, dateFinFiltre: null, pseudoFiltre: null});
}

/*************************************/
/***** BOUCLE QUI SCROLL LA PAGE *****/
/*************************************/
async function scrollBoucle() {
	let { dateDebutFiltre, dateFinFiltre, pseudoFiltre } = await browser.storage.local.get(["dateDebutFiltre", "dateFinFiltre","pseudoFiltre"]);

	while(true){
		//On vérifie que le bouton de suppression est bien activé, sinon on arrête de force la suppression
		let { activeBoutonSuppression } = await browser.storage.local.get("activeBoutonSuppression");
		if(!activeBoutonSuppression) {
			console.error("L'arrêt de la suppression a été forcé.");
			break;
		}

		//On vérifie à chaque fois si on est à la fin du profil
		if(await finProfil()) {
			cleanVariablesLocales();
			break;
		}

		//Si on a des filtres de date, filtrer avec les dates
		if(dateDebutFiltre || dateFinFiltre) {
			await chchTweetDansIntervalleDates(dateDebutFiltre, dateFinFiltre);
		}

		//On récupère le premier tweet visible de la fenêtre
		let tweet = premierTweetVisible();

		//Si un tweet est dispo, le supp si c'est un tweet de soi, ou le unretweet si c'est un retweet
		if(tweet) {
			let pseudoTweet = tweet.querySelector('[data-testid="User-Name"] [tabindex="-1"]').innerText;

			//Si c'est l'épinglé ne pas le toucher
			if(estEpingle(tweet)) {
				console.log("EPINGLE ", pseudoTweet);
				window.scrollBy(0, window.innerHeight*0.9);

			//Si c'est un retweet annuler le retweet
			} else if(estRetweet(tweet)) {
				console.log("RETWEET ", pseudoTweet);
				//On supprime si pas de filtre pseudo, sinon on vérifie le pseudo du tweet
				if(!pseudoFiltre) {
					await annulRetweet(tweet);
				} else if (pseudoFiltre == pseudoTweet.split('@')[1]) {
					await annulRetweet(tweet);
				}

			//Si c'est un tweet à moi supprimer avec les trois petits points
			} else if(estMonTweet(tweet)) {
				console.log("TWEET ", pseudoTweet);
				//On supprime si pas de filtre pseudo, sinon on vérifie le pseudo du tweet
				if(!pseudoFiltre) {
					await suppTweet(tweet);
				} else if (pseudoFiltre == pseudoTweet.split('@')[1]) {
					await suppTweet(tweet);
				}

			//Un truc imprévu
			} else {
				console.log("IL Y A QUELQUE CHOSE D'IMPREVUE");
				console.log(tweet);
				cleanVariablesLocales();
				break;
			}
		} else {
			window.scrollBy(0, window.innerHeight*0.9);
		}

		await new Promise(tps => setTimeout(tps, 400));
	}

	cleanVariablesLocales();
	console.log("***** FIN DU PROGRAMME *****");
}


/***************************************************/
/***************************************************/
/********************* LE MAIN *********************/
/***************************************************/
/***************************************************/
let monPseudo = "@" + window.location.pathname.split("/")[1];
console.log("***** SUPPRESSION TWEET DE ", monPseudo, " *****");
scrollBoucle();

})();