(() => {

//TEST
/*
var tweets = document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="tweet"]');
var tweet = Array.from(tweets).find(t => {
	var positionTweet = t.getBoundingClientRect();
	return positionTweet.top >=60
});
annulRetweet(tweet);

*/

/***********************************************/
/*** APPARITION D'UN ELEMENT DANS LA FENETRE ***/
/***********************************************/
function apparitionElement(selecteur, delai = 5000) {
	return new Promise((resolue, rejetee) => {
		let debut = Date.now();
		let sablier = setInterval(() => {
			if(document.querySelector(selecteur)) {
				resolue(document.querySelector(selecteur));
				clearInterval(sablier);

			} else if (Date.now() - debut > delai) {
				rejetee();
				clearInterval(sablier);
			}
		}, 100);
	});
}

/************************************************/
/*** DISPARITION D'UN ELEMENT DANS LA FENETRE ***/
/************************************************/
function disparitionElement(selecteur, tweet, delai = 5000) {
	return new Promise((resolue, rejetee) => {
		let debut = Date.now();
		let sablier = setInterval(() => {
			if(!document.querySelector(selecteur)) {
				resolue();
				clearInterval(sablier);

			} else if (Date.now() - debut > delai) {
				console.error("Le tweet n'a pas été supprimé");
				console.error(tweet);
				rejetee();
				clearInterval(sablier);
			}
		}, 100);
	});
}


/************************************/
/*** SUPPRESSION D'UN TWEET A SOI ***/
/************************************/
//penser à mettre des sécurité pour pas que ça plante
async function suppTweet(tweet) { 
	//Appuie sur les 3 petits points du tweet
	tweet.querySelector('[type="button"], [data-testid="caret"]').click();

	//Vérifie que le manu apparaisse bien après le click sur les ...
	//Appuie sur supprimer dans le menu déroulant,
	try {
		let menuDeroulantTweet = await apparitionElement('[data-testid="Dropdown"]');
		let suppBouton = menuDeroulantTweet.querySelector('[role="menuitem"] span');
		suppBouton.click();
	} catch {
		console.error("PROBLEME : promesse d'apparition d'élèment rejetee, attente trop longue");
	}

	//Verifie que la fenêtre de confirmation de suppression apparaisse bien après le click sur supprimer
	//Appuie sur supprimer dans la fenêtre de confirmation de suppression, 
	try {
		let menuConfirmationSuppresion = await apparitionElement('[data-testid="confirmationSheetDialog"]');
		let confirmationSuppBouton = menuConfirmationSuppresion.querySelector('[data-testid="confirmationSheetConfirm"]');
		confirmationSuppBouton.click();
		await disparitionElement('[data-testid="confirmationSheetConfirm"]', tweet);
	} catch {
		console.error("PROBLEME : promesse d'apparition d'élèment rejetee, attente trop longue");
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
		console.error("PROBLEME : promesse d'apparition d'élèment rejetee, attente trop longue");
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
	while(Date.now() - debut < 5000){

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
				console.log(tweet.querySelector('[data-testid="tweetText"]').innerText);
				annulRetweet(tweet);

			//Si c'est un tweet à moi supprimer avec les trois petits points
			} else if(estMonTweet(tweet)) {
				console.log("TWEET ", pseudo);
				console.log(tweet.querySelector('[data-testid="tweetText"]').innerText);
				suppTweet(tweet);

			//Un truc imprévu
			} else {
				console.log("IL Y A QUELQUE CHOSE D'IMPREVUE");
				console.log(tweet);
				break;
			}
		} else {
			window.scrollBy(0, window.innerHeight*0.9);
		}

		await new Promise(r => setTimeout(r, 100));
	}
}


/***************************************************/
/***************************************************/
/********************* LE MAIN *********************/
/***************************************************/
/***************************************************/
let monPseudo = "@" + window.location.pathname.split("/")[1];
console.log("Pseudo ", monPseudo);
scrollBoucle();

})();


