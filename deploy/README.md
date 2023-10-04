# JSON server local et sur Heroku

## Avant note

Sous Linux / avec NPM et NodeJS, vous pouvez juste installer et lancer json-server. 


## Lancement 

`node index.js`

It runs on port 3003 by default.

## Origine

Ce projet est juste un petit environnement et notes pour créer un JSON server local et distant. 
L’executable se lance sur le port 5000 par défaut !

Il repose sur l’excellent json-server.
> https://github.com/typicode/json-server

Le but est de permettre la collecte de résultat et l’analyse avec l’experience companion.

https://gitlab.com/peac2h/experience-companion


## Construire l’executable 

Il est construit avec [Pkg](https://github.com/zeit/pkg). 

```
pkg index.js --targets node12-win-x64

```

Il est déployé sur Dropbox avec les contenus du dossier `dist` qui permettent de changer le port. 


## Déploiment en ligne

Le serveur est également en ligne: 

https://micropeach-json.herokuapp.com/

Attention cependant les données sont éphémères sur Heroku, donc au moins tous les jours la base est 
remise à zéro !


# Notes

Ce dépôt est copié depuis le modèle de dépôt NodeJS / Express de Heroku.

https://github.com/heroku/node-js-getting-started#node-js-getting-started
