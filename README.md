# YamMaster

## Installer et lancer le front

``` bash
npm install
npx expo install @expo/metro-runtime
npx expo start
```

## Installer et lancer le back

``` bash
cd websocket-game-server
npm install
npm run start
```

## Info de jeu

- Le Yam Prédator n'ai pas implémenter
- La case défi à une chance sur 10 de s'activer et elle sera utilisable seulement si une combinaison de dés est reussi.
- Pour réglé le vitesse d'action du bot il faut modifié dans l'index du back à la ligne 617 la constante botSpeed = "1000";
- Le bot peut jouer contre lui même, il faut mettre a true la constante const botVsBot = false; à la ligne 517

## Avertissement de bug

A cause du fonctionnement du composant games[], il faut éviter de lancer plusieur parties en même temps.
