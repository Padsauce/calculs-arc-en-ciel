# Calculs Arc-en-ciel

Jeu de calcul mental pour téléphone et ordinateur : 5 niveaux, course aux 10 points ou chrono (15 s, 30 s, 1 min), profils avec avatars, tableau des scores.

- `index.html` : le jeu (tout tient dans ce fichier).
- `firestore.rules.txt` : règles de la base Firebase du tableau commun.
- `sw.js`, `manifest.webmanifest`, icônes et `splash/` : le jeu installable comme une appli (écran d’accueil), utilisable sans connexion.

**Diceplacement Adventures Dungeon**, le jeu de donjon aux dés du même auteur, utilise le même projet Firebase. Il lit `players` (`name`, `avatar`, `updated`), `scores` (`name`, `avatar`, `date`) et `hidden` (`name`), et n’écrit que dans sa collection `dungeon`. Pour ne pas le casser :
- ne pas renommer ces collections ni ces champs sans modifier Diceplacement en même temps ;
- la liste `AVATARS` : on ajoute seulement à la fin, sans jamais réordonner, et on ajoute les mêmes emojis dans Diceplacement.

Les versions numérotées sont archivées dans le projet Claude « Jeu Calcul Mental ».
