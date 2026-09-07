# Guide de soutenance — Prédiction des prix Airbnb NYC
### Version débutante — tout expliqué depuis zéro

Ce guide part du principe que tu ne connais pas le Machine Learning. Chaque concept est expliqué avec des mots simples et une image concrète avant d'être relié à ton projet. Lis la Partie 1 en entier une première fois pour comprendre les bases, puis la Partie 2 pour le fil de ton projet, puis entraîne-toi avec la Partie 4 (script minute par minute) et la Partie 5 (questions du jury).

Tu as **12 minutes** de présentation. Ça veut dire qu'il faut aller à l'essentiel à l'oral et garder les détails en tête seulement pour les questions. Ce guide te donne les deux niveaux : le résumé court à dire, et le détail complet à comprendre pour ne jamais être bloquée.

---

# PARTIE 1 — Les bases du Machine Learning (à savoir avant tout)

## 1.1 C'est quoi, "prédire un prix avec du Machine Learning" ?

Imagine que tu es une agente immobilière très expérimentée. Après avoir vu 40 000 logements et leurs prix, tu développes une intuition : "un logement entier à Manhattan, ça vaut cher ; une chambre partagée dans le Bronx, ça vaut peu." Tu ne suis pas une formule mathématique fixe — tu as juste **appris à partir d'exemples**.

Le Machine Learning (apprentissage automatique), c'est exactement ça, mais fait par un ordinateur :
- On lui montre des **milliers d'exemples** (48 000 annonces Airbnb, chacune avec son prix réel).
- Il **cherche automatiquement des régularités** ("quand le logement est entier ET loin du centre, le prix baisse un peu ; quand il est entier ET à Manhattan, le prix monte beaucoup").
- Une fois "entraîné", on lui donne une **nouvelle annonce qu'il n'a jamais vue**, et il devine son prix.

C'est ce qu'on appelle un **modèle** : un programme qui a "appris" une règle à partir de données, plutôt qu'une règle écrite à la main par un humain.

## 1.2 Régression, c'est quoi ?

Il y a deux grandes familles de problèmes en Machine Learning :
- **Classification** : deviner une catégorie (ce mail est-il un spam : oui/non ? cette photo montre-t-elle un chat ou un chien ?).
- **Régression** : deviner un **nombre** (quel est le prix de ce logement ? quelle sera la température demain ?).

Ton projet est un problème de **régression**, parce que tu prédis un prix (un nombre continu, qui peut être 45$, 87$, 312$...), pas une catégorie.

## 1.3 C'est quoi une "feature" (variable) ?

Une **feature**, c'est une caractéristique qu'on donne au modèle pour l'aider à deviner. Dans ton projet, les features sont : le type de logement, l'arrondissement, la latitude/longitude, le nombre d'avis, la disponibilité, etc.

**Analogie** : si tu demandes à quelqu'un de deviner le prix d'une voiture, tu lui donnes des indices (la marque, l'année, le kilométrage). Ces indices sont les "features". Plus les indices sont pertinents, meilleure est la estimation.

La chose que le modèle essaie de deviner (ici, le **prix**) s'appelle la **cible** (target ou variable à prédire).

## 1.4 Entraînement et Test : l'analogie de l'examen

C'est **le concept le plus important à comprendre**, celui qui revient dans presque toutes les questions de jury.

Imagine un·e étudiant·e qui révise avec des annales d'examen. Si le jour J on lui repose exactement les mêmes annales, il/elle aura 20/20 — mais ça ne prouve pas qu'il/elle a compris le cours, juste qu'il/elle a mémorisé les réponses.

Pour vraiment tester sa compréhension, il faut lui poser **des questions qu'il/elle n'a jamais vues**.

C'est pour ça qu'en Machine Learning on sépare toujours les données en deux :
- **Le jeu d'entraînement (train set)** — 80 % des données ici — c'est "les annales" : le modèle les voit et apprend dessus.
- **Le jeu de test (test set)** — les 20 % restants — le modèle ne les voit JAMAIS pendant l'entraînement. On s'en sert seulement à la fin, pour vérifier s'il devine bien sur des annonces inconnues.

**Si le modèle est excellent sur le train mais mauvais sur le test → il a "appris par cœur" au lieu de comprendre.** On appelle ça le **sur-apprentissage** (overfitting), voir 1.5.

Dans ton code, cette séparation se fait avec `train_test_split(X, y, test_size=0.2, random_state=42)` — le `0.2` veut dire 20 % pour le test, et `random_state=42` est juste un chiffre qui garantit que si tu relances le code, tu obtiens exactement le même découpage (reproductibilité).

## 1.5 Le sur-apprentissage (overfitting) : l'analogie du par cœur

Reprenons l'étudiant·e. S'il/elle mémorise 100 % des annales sans comprendre la logique, il/elle sera perdu·e à la moindre question légèrement différente le jour de l'examen.

Un modèle qui **sur-apprend** fait pareil : il "mémorise" les 38 000 annonces d'entraînement dans le moindre détail (y compris leur bruit, leurs erreurs de saisie), mais devine mal sur des annonces nouvelles.

**Comment on l'évite ?** En limitant la complexité du modèle (par exemple, en limitant la profondeur d'un arbre de décision — `max_depth`), et en vérifiant toujours la performance sur le jeu de test, jamais seulement sur le train.

## 1.6 La validation croisée : l'analogie des 5 examens blancs

Le problème avec un seul découpage train/test, c'est que **le hasard peut favoriser ou défavoriser** ton modèle. Si par malchance ton jeu de test contient beaucoup d'annonces atypiques, ton score sera faussé.

**Solution : la validation croisée à 5 plis (5-fold cross-validation).** On découpe les données d'entraînement en 5 parties égales. On fait ensuite 5 "manches" :
- Manche 1 : on entraîne sur les parties 2,3,4,5 et on teste sur la partie 1.
- Manche 2 : on entraîne sur 1,3,4,5 et on teste sur la partie 2.
- ... et ainsi de suite jusqu'à la manche 5.

À la fin, on a 5 scores, et on prend la moyenne. C'est comme faire **5 examens blancs différents** plutôt qu'un seul, pour être sûr que la note n'est pas due à la chance.

## 1.7 Les hyperparamètres : les réglages du modèle

Un modèle a des **paramètres** qu'il apprend tout seul pendant l'entraînement (par exemple, dans une régression linéaire, les coefficients associés à chaque variable).

Mais il a aussi des **hyperparamètres** : des réglages qu'on fixe **avant** l'entraînement, à la main. Par exemple : "je veux que la forêt aléatoire construise 300 arbres" (`n_estimators=300`), ou "je limite la profondeur de chaque arbre à 6" (`max_depth=6`).

**Analogie** : c'est comme régler un four avant de faire un gâteau. Le four (le modèle) apprend à cuire, mais toi tu dois choisir la température et le temps (les hyperparamètres) avant. Si mal réglés → gâteau brûlé (sur-apprentissage) ou pas assez cuit (sous-apprentissage).

**L'optimisation des hyperparamètres**, c'est tester plusieurs réglages pour trouver la meilleure combinaison. Dans ton projet, tu utilises `RandomizedSearchCV`, qui teste 12 combinaisons choisies au hasard plutôt que absolument toutes les combinaisons possibles (ce qui prendrait beaucoup trop de temps).

## 1.8 Comment on juge si un modèle est bon ? Les métriques

Une fois le modèle entraîné, comment on sait s'il est bon ? On compare ses prédictions sur le jeu de test aux vrais prix, et on calcule des **métriques d'erreur**.

### MAE (Mean Absolute Error) — l'erreur moyenne, en dollars

C'est la métrique la plus simple à comprendre : **en moyenne, de combien de dollars le modèle se trompe-t-il ?**

Exemple concret : si le vrai prix est 100$ et le modèle prédit 148$, l'erreur est de 48$. On fait ça pour toutes les annonces du jeu de test, on prend la valeur absolue (pour que les erreurs "trop cher" et "pas assez cher" ne s'annulent pas), et on fait la moyenne.

**Ton résultat : MAE = 48,35 $.** Ça veut dire : en moyenne, ton modèle se trompe d'environ 48 dollars par nuit.

### RMSE (Root Mean Squared Error) — comme la MAE, mais qui déteste les grosses erreurs

La RMSE fait la même chose que la MAE, mais elle **met les erreurs au carré avant de faire la moyenne**, puis reprend la racine carrée à la fin.

**Pourquoi mettre au carré ?** Parce que ça punit beaucoup plus fort les grosses erreurs. Une erreur de 10$ au carré = 100. Une erreur de 100$ au carré = 10 000 (100 fois plus, pas juste 10 fois plus). Donc la RMSE est plus sensible aux prédictions vraiment ratées.

**Ton résultat : RMSE = 84,49 $.** Le fait que la RMSE (84,49$) soit plus grande que la MAE (48,35$) veut dire qu'il existe quelques prédictions très mauvaises qui tirent la moyenne vers le haut (des annonces avec des prix très inhabituels, difficiles à deviner).

### R² (coefficient de détermination) — le pourcentage "expliqué"

Le R² répond à la question : **"quelle proportion de la variation des prix mon modèle arrive-t-il à expliquer ?"**

- R² = 1 → le modèle prédit parfaitement tous les prix.
- R² = 0 → le modèle ne fait pas mieux que de toujours prédire "le prix moyen" pour toutes les annonces, peu importe leurs caractéristiques.
- R² négatif → le modèle est pire que de prédire juste la moyenne (mauvais signe).

**Ton résultat : R² = 0,453.** Ça veut dire que ton modèle explique **45,3 %** de la variation des prix à partir des caractéristiques utilisées. Les 54,7 % restants dépendent de facteurs que tu n'as pas dans tes données (qualité perçue, photos, décoration, négociation...).

### MAPE (Mean Absolute Percentage Error) — l'erreur en pourcentage

Comme la MAE, mais exprimée en **pourcentage du prix réel** plutôt qu'en dollars. Utile car se tromper de 20$ sur une annonce à 50$ (40 % d'erreur) n'est pas pareil que se tromper de 20$ sur une annonce à 500$ (4 % d'erreur).

**Ton résultat : MAPE = 36,1 %.** En moyenne, l'erreur du modèle représente environ 36 % du prix réel de l'annonce.

**Pourquoi utiliser 4 métriques et pas une seule ?** Parce que chacune raconte une histoire différente : MAE donne une erreur "typique" facile à interpréter, RMSE révèle si le modèle fait de grosses erreurs occasionnelles, R² donne une vision globale en pourcentage, MAPE relativise l'erreur par rapport au prix. Utiliser les 4 ensemble donne une vision complète, pas biaisée par une seule métrique.

## 1.9 Les familles d'algorithmes, expliquées simplement

### Régression linéaire (et Ridge, Lasso, ElasticNet)

**L'idée** : le prix est calculé comme une somme pondérée des caractéristiques. Par exemple (simplifié) : `prix = 50 + 30 × (logement entier ?) - 2 × (distance en km) + ...`

**Analogie** : c'est une recette de cuisine simple avec des quantités fixes — "ajoute 30 points si c'est un logement entier, enlève 2 points par kilomètre du centre." C'est simple et facile à expliquer, mais ça ne capture pas les cas où l'effet d'une variable dépend d'une autre (par exemple, être loin du centre ne coûte pas la même chose à Manhattan et dans le Bronx).

Ridge, Lasso et ElasticNet sont des versions "régularisées" de la régression linéaire : elles ajoutent une pénalité qui empêche les coefficients de devenir trop grands, ce qui limite le sur-apprentissage. C'est un détail technique, pas essentiel à retenir par cœur — l'important est de savoir que ce sont des **variantes de la même famille linéaire**.

### KNN (K plus proches voisins)

**L'idée** : pour deviner le prix d'une nouvelle annonce, on regarde les **15 annonces les plus ressemblantes** dans les données (les "K plus proches voisins", ici K=15) et on fait la moyenne de leurs prix.

**Analogie** : "je ne sais pas combien vaut ta maison, mais je vais regarder les 15 maisons les plus similaires dans le quartier et faire la moyenne de leur prix."

### Arbre de décision

**L'idée** : une succession de questions oui/non, comme un jeu "qui est-ce ?". Par exemple : "Est-ce un logement entier ? Oui → Est-ce à Manhattan ? Oui → prix estimé 180$." "Non → Est-ce à moins de 5km du centre ? ..."

**Analogie** : un arbre de décision, c'est littéralement un arbre généalogique de questions qui se termine par une estimation de prix à chaque feuille.

### Random Forest et Extra Trees (forêts d'arbres)

**L'idée** : au lieu de faire confiance à un seul arbre de décision (qui peut se tromper ou trop coller aux données), on en construit **des centaines**, chacun légèrement différent (entraîné sur un sous-ensemble aléatoire des données et des variables), et on fait la moyenne de leurs prédictions.

**Analogie** : plutôt que de demander l'avis d'un seul agent immobilier, tu demandes l'avis de 300 agents différents et tu fais la moyenne. Même si certains se trompent, l'erreur moyenne du groupe est généralement plus fiable qu'un seul avis. C'est le principe de la "sagesse des foules".

Random Forest et Extra Trees sont deux variantes très proches de cette idée (Extra Trees ajoute un peu plus de hasard dans la construction de chaque arbre).

### Gradient Boosting et XGBoost (boosting)

**L'idée** : contrairement à Random Forest qui construit tous les arbres indépendamment puis fait la moyenne, le **boosting** construit les arbres **un par un, dans l'ordre**, et chaque nouvel arbre se concentre spécifiquement sur **corriger les erreurs** que les arbres précédents ont commises.

**Analogie** : le premier agent immobilier fait une première estimation, forcément imparfaite. Le deuxième agent regarde uniquement les erreurs du premier et essaie de les corriger. Le troisième corrige ce qui reste comme erreur après les deux premiers. Et ainsi de suite. À la fin, on additionne toutes les corrections.

XGBoost est une version très optimisée et performante de cette idée de boosting — c'est l'algorithme qui gagne le plus souvent les compétitions de Machine Learning sur ce type de données (des tableaux de chiffres, pas des images ou du texte).

**C'est ton modèle final, donc il faut bien comprendre cette idée de "correction successive des erreurs".**

### SVR (Support Vector Regression)

**L'idée** : trouver une "tendance" qui passe au plus près de un maximum de points, en acceptant une petite marge d'erreur tolérée, mais qui pénalise fortement les points trop éloignés de cette tendance.

**Analogie (simplifiée)** : imagine que tu traces une route qui doit passer aussi près que possible du plus grand nombre de maisons sur une carte, avec une bande de tolérance de chaque côté. C'est une méthode plus mathématique, moins intuitive — pas besoin de la maîtriser en détail, seulement savoir qu'elle a été testée et qu'elle est moins adaptée ici (voir limites).

### MLP — réseau de neurones (Multi-Layer Perceptron)

**L'idée** : imite (très grossièrement) le fonctionnement de neurones biologiques. Les données passent à travers plusieurs "couches" de calculs mathématiques (ici deux couches de 64 puis 32 neurones), chaque couche transformant l'information pour capturer des relations de plus en plus complexes.

**Analogie** : une chaîne de production où chaque poste de travail (couche) transforme un peu plus la matière première (les données) jusqu'à obtenir le produit fini (la prédiction de prix).

**Pourquoi il ne gagne pas ici ?** Les réseaux de neurones ont surtout leur force sur des données non structurées (images, texte, son) ou sur d'énormes volumes de données. Sur un tableau de 48 000 lignes avec 15 colonnes, les méthodes à base d'arbres (Random Forest, XGBoost) restent généralement plus performantes — c'est un résultat que ton projet confirme concrètement.

---

# PARTIE 2 — Le fil de ton projet, en détail

## 2.1 Le pitch de 30 secondes (à savoir par cœur, mot pour mot si besoin)

> "Mon projet prédit le prix d'une nuit sur Airbnb à New York, à partir de caractéristiques comme le type de logement, la localisation et la popularité de l'annonce — sans utiliser de photos ni de texte. J'ai comparé 12 algorithmes de Machine Learning avec un protocole rigoureux et identique pour tous, optimisé les hyperparamètres des trois meilleurs, et développé une application interactive qui permet d'explorer les données, d'entraîner un modèle au choix, et de tester une prédiction en temps réel sur une carte. Le meilleur modèle, XGBoost optimisé, explique 45 % de la variation du prix avec une erreur moyenne d'environ 48 dollars par nuit."

## 2.2 La veille scientifique — ce que dit la littérature, et pourquoi ces outils

Avant de coder, il faut situer son projet par rapport à l'existant — c'est ce qu'on
appelle la veille scientifique et technique (section 2 du rapport, une partie
obligatoire du cahier des charges).

**Ce que dit la littérature sur la prédiction de prix immobilier :**
- Les approches historiques (régression hédonique) décomposent le prix en une
  somme pondérée de caractéristiques — simples et interprétables, mais
  incapables de capturer les interactions entre variables.
- Depuis les années 2000, les méthodes d'ensemble à base d'arbres (Random
  Forest — Breiman, 2001 ; XGBoost — Chen & Guestrin, 2016) se sont imposées
  comme état de l'art sur les données tabulaires, car elles gèrent nativement
  les non-linéarités et interactions.
- Sur ce même dataset spécifiquement, les travaux publiés rapportent
  généralement un R² entre 0,5 et 0,65 lorsqu'on n'utilise pas les avis
  textuels ni les photos — une limite structurelle que ton propre résultat
  (R² = 0,45) confirme et respecte.

**Le benchmark des outils** — pour chaque brique technique, plusieurs options
ont été comparées avant de choisir (détail dans le rapport, section 2.2) :
- **Machine Learning** : scikit-learn (retenu, écosystème mature) vs
  TensorFlow/PyTorch (écarté, surdimensionné pour un problème de régression
  tabulaire de cette taille).
- **Interface graphique** : Streamlit (retenu, développement rapide en pur
  Python) vs Dash (plus flexible mais plus long à mettre en place) vs
  application web classique React + API (beaucoup trop long pour le temps
  imparti).
- **Cartographie** : Plotly (retenu pour l'affichage, cartes interactives
  simples) et Folium (retenu spécifiquement pour l'onglet Test, car c'est la
  seule librairie testée qui permette de récupérer les coordonnées d'un clic
  utilisateur dans Streamlit).

**Phrase à retenir pour l'oral** : *"Je ne suis pas partie de zéro : la
littérature confirme que les méthodes à base d'arbres dominent sur ce type de
données, et mon benchmark de 12 modèles retrouve exactement cette hiérarchie
— ce qui valide à la fois mon protocole et les résultats de la littérature."*

## 2.3 Le dataset — ce qu'il faut savoir

- Source : Kaggle, *New York City Airbnb Open Data* — c'est le dataset précis demandé dans ton sujet de projet.
- 48 895 annonces, 16 colonnes de départ : identifiant, hôte, arrondissement (`neighbourhood_group`), quartier (`neighbourhood`), latitude/longitude, type de logement (`room_type`), prix, nuits minimum, nombre d'avis, date du dernier avis, avis par mois, nombre d'annonces de l'hôte, disponibilité annuelle.
- **Il n'y a ni photo, ni texte de description, ni note moyenne des avis.** C'est important à dire toi-même au jury avant qu'on te le reproche : ça explique pourquoi le modèle ne peut pas tout deviner parfaitement.

## 2.4 Le nettoyage des données (prétraitement)

Avant de donner les données à un modèle, il faut les "nettoyer" — comme on ne cuisine pas des légumes sans les laver avant.

**Valeurs manquantes** : certaines annonces n'ont jamais reçu d'avis, donc pas de date de dernier avis. Plutôt que de laisser un "trou", on crée une variable qui dit clairement "cette annonce n'a jamais eu d'avis" (`has_reviews = faux`), et on remplace la date manquante par une valeur qui représente "très ancien / jamais".

**Valeurs aberrantes** : quelques annonces avaient un prix de 0$ (impossible, sûrement une erreur) ou des prix extrêmement élevés/bas (probablement des erreurs de saisie ou des cas très particuliers). On les retire en utilisant les **percentiles** : on garde seulement les prix qui se trouvent entre les 0,5 % les plus bas et les 99,5 % les plus hauts de la distribution. Résultat : 492 annonces retirées sur 48 895 (soit 1 %).

**Création de nouvelles variables (feature engineering)** — c'est-à-dire fabriquer de nouveaux indices à partir des données brutes pour aider le modèle :
- `distance_center_km` : à quelle distance (en kilomètres) l'annonce se trouve du centre de Manhattan. Calculée avec la formule de **haversine**, qui calcule une vraie distance sur une sphère (la Terre n'est pas plate !) à partir de deux coordonnées GPS.
- `availability_ratio` : la disponibilité annuelle transformée en pourcentage (plus facile à lire que "180 jours sur 365").
- `reviews_per_listing` : le nombre d'avis rapporté au nombre d'annonces de l'hôte (un hôte pro avec 10 logements et 50 avis au total, ce n'est pas pareil qu'un particulier avec 1 logement et 50 avis).
- `neighbourhood_freq` : voir l'encodage ci-dessous.

**L'encodage** — transformer du texte en nombres, car un modèle ne comprend que des chiffres :
- Le type de logement (3 catégories) et l'arrondissement (5 catégories) sont transformés en colonnes de 0 et 1 (une colonne par catégorie) — ça s'appelle le **one-hot encoding**. Exemple : la colonne "Entire home/apt" vaut 1 si c'est un logement entier, 0 sinon.
- Le quartier (`neighbourhood`) a **221 valeurs différentes** — trop pour faire un one-hot (ça créerait 221 colonnes, la plupart remplies de zéros). À la place, on remplace chaque quartier par **sa fréquence** : la proportion d'annonces qui se trouvent dans ce quartier par rapport à toutes les annonces. Un quartier très demandé aura une fréquence plus élevée qu'un quartier rare.

## 2.5 L'analyse exploratoire — comprendre avant de modéliser

Avant de lancer des modèles, on regarde les données "à l'œil" avec des graphiques, pour se faire une première idée.

- **La distribution des prix** est très asymétrique : beaucoup d'annonces autour de 70-100$, puis de moins en moins d'annonces au fur et à mesure que le prix monte, avec quelques annonces très chères qui tirent la moyenne vers le haut. C'est pour ça que la moyenne (141,9$) est plus élevée que la médiane (106$, le prix "du milieu" si on classe toutes les annonces).
- **Le prix par arrondissement** : Manhattan (149,5$ médian) est nettement plus cher que le Bronx (68$ médian).
- **Le prix par type de logement** : un logement entier (160$ médian) coûte 2 à 3 fois plus qu'une chambre privée (70$) ou partagée (~45$).
- **La corrélation** : `distance_center_km` a la corrélation la plus forte avec le prix parmi les variables numériques (-0,31 : plus on s'éloigne du centre, moins c'est cher en moyenne), mais cette corrélation reste modérée — ça annonce déjà que le modèle ne pourra pas tout expliquer avec les variables disponibles.

## 2.6 Comparer 12 modèles — le cœur du projet

Pour que la comparaison soit honnête, **tous les modèles reçoivent exactement les mêmes données, dans les mêmes conditions** : mêmes variables, même découpage 80/20 train/test, même validation croisée à 5 plis. Sinon, ce serait comme comparer deux étudiant·e·s qui n'ont pas passé le même examen.

Voici le classement (RMSE sur le jeu de test — plus c'est bas, mieux c'est) :

| Rang | Modèle | RMSE | R² |
|---|---|---|---|
| 1 | XGBoost | 85,05 $ | 0,445 |
| 2 | Extra Trees | 85,07 $ | 0,445 |
| 3 | Random Forest | 85,64 $ | 0,438 |
| 4 | Gradient Boosting | 87,55 $ | 0,412 |
| 5 | Réseau de neurones (MLP) | 88,46 $ | 0,400 |
| 6 | KNN | 89,22 $ | 0,390 |
| 7 | SVR | 93,20 $ | 0,334 |
| 8 | Arbre de décision | 93,59 $ | 0,329 |
| 9-10 | Régression linéaire / Ridge | 93,65 $ | 0,328 |
| 11 | Lasso | 93,95 $ | 0,323 |
| 12 | ElasticNet | 98,08 $ | 0,263 |

**Ce qu'il faut retenir et savoir expliquer** : les 3 premiers sont tous des méthodes à base de **plusieurs arbres combinés** (Random Forest, Extra Trees, XGBoost). Elles gagnent parce que la relation entre le prix et les caractéristiques n'est pas une simple addition (ce que fait la régression linéaire) — il y a des **interactions** : par exemple, être loin du centre ne fait pas baisser le prix de la même façon selon que le logement est entier ou une simple chambre. Les modèles à base d'arbres peuvent capturer ce genre de nuance ; les modèles linéaires, non.

## 2.7 Optimiser les 3 meilleurs modèles

On ne perd pas de temps à optimiser les modèles les moins bons (ça ne changerait pas le classement). On prend les 3 premiers (XGBoost, Extra Trees, Random Forest) et on teste, pour chacun, **12 combinaisons différentes de réglages** (hyperparamètres), en utilisant une méthode appelée `RandomizedSearchCV`.

**Résultat final** : XGBoost avec les réglages suivants :
- `n_estimators = 400` (le modèle construit 400 arbres successifs)
- `max_depth = 6` (chaque arbre ne pose pas plus de 6 questions en profondeur — limite le sur-apprentissage)
- `learning_rate = 0,03` (chaque nouvel arbre corrige les erreurs précédentes "doucement", à petits pas, ce qui rend l'apprentissage plus stable)
- `subsample = 0,7` (chaque arbre est construit sur seulement 70 % des données tirées au hasard, ce qui ajoute de la diversité et réduit encore le risque de sur-apprentissage)

Cela améliore légèrement le score : RMSE de 85,05$ à 84,49$ (amélioration de 0,66%). **Ce gain est petit, et c'est normal** : les réglages par défaut des librairies sont déjà bien pensés. Le vrai gain de performance vient du choix de la famille d'algorithme (arbres plutôt que linéaire), pas du réglage fin.

## 2.8 L'importance des variables — qu'est-ce qui influence vraiment le prix ?

Une fois le modèle final entraîné, on peut lui demander : "sur quelles variables t'es-tu le plus appuyé pour faire tes prédictions ?" C'est ce qu'on appelle la **feature importance**.

**Résultat surprenant et important à mentionner** : la variable "logement entier" (`room_type = Entire home/apt`) représente à elle seule **59,5 %** de l'importance totale du modèle — de très loin devant la distance au centre (4,5 %). 

**Ce que ça veut dire en langage simple** : le type de logement compte beaucoup plus que l'endroit où il se trouve dans Manhattan/Brooklyn/etc. Un logement entier vaut nettement plus cher, où qu'il soit, alors que la localisation ne fait varier le prix qu'à la marge en comparaison.

## 2.9 L'application (l'interface graphique)

L'application est construite avec **Streamlit**, un outil qui permet de créer une interface web interactive en écrivant seulement du Python (pas besoin de savoir faire des sites web).

Trois onglets :

1. **Exploration des données** : on peut voir les statistiques, les graphiques, et une carte de toutes les annonces.
2. **Entraînement / choix du modèle** : on choisit un modèle parmi 9, on règle ses paramètres avec des curseurs, on clique sur "entraîner", et on voit immédiatement les 4 métriques (RMSE, MAE, R², MAPE). On peut aussi charger directement le meilleur modèle (XGBoost optimisé) déjà entraîné.
3. **Test / Prédiction** : on clique sur une carte pour choisir un emplacement, on remplit un petit formulaire (type de logement, nombre d'avis, etc.), et l'application affiche le prix prédit, le compare au prix moyen de l'arrondissement, et montre les annonces existantes les plus proches sur une carte.

**Exemple réel testé** : pour un logement entier dans le Bronx, le modèle a prédit **166 $/nuit**, alors que le prix moyen dans le Bronx est de 87 $ — soit un écart de +79 $, ce qui montre bien l'effet dominant du type de logement (Bronx + logement entier = plus cher que la moyenne de l'arrondissement, qui inclut beaucoup de chambres privées moins chères).

---

# PARTIE 3 — Un mini-lexique à connaître par cœur

| Terme | Explication simple |
|---|---|
| Modèle | Un programme qui a appris une règle à partir d'exemples, plutôt qu'une règle écrite à la main |
| Feature (variable) | Une caractéristique donnée en entrée au modèle (ex : le type de logement) |
| Cible (target) | Ce que le modèle essaie de deviner (ici, le prix) |
| Entraînement (training) | La phase où le modèle "apprend" à partir des exemples connus |
| Jeu de test | Des exemples que le modèle n'a jamais vus, utilisés pour vérifier s'il devine bien |
| Sur-apprentissage (overfitting) | Le modèle a "appris par cœur" au lieu de comprendre, et se trompe sur du nouveau |
| Hyperparamètre | Un réglage du modèle fixé avant l'entraînement (ex : nombre d'arbres) |
| Validation croisée | Tester le modèle 5 fois sur des découpages différents pour une estimation plus fiable |
| RMSE / MAE | L'erreur moyenne du modèle, en dollars |
| R² | Le pourcentage de la variation du prix que le modèle arrive à expliquer |
| Encodage | Transformer du texte/catégories en nombres compréhensibles par un modèle |
| Pipeline | Un enchaînement automatique et reproductible d'étapes (nettoyage puis modèle) |

---

# PARTIE 4 — Script minute par minute pour tes 12 minutes

Le deck fait maintenant **16 slides** (une slide "Veille scientifique et technique" a été ajoutée — elle correspond à la section 2 du rapport, obligatoire dans le cahier des charges, et manquait à l'oral). Avec 16 slides en 12 minutes, tu as en moyenne **45 secondes par slide** — c'est rapide, donc va à l'essentiel à l'oral et garde le détail pour les questions. Le tableau ci-dessous totalise **11 min 20**, ce qui te laisse volontairement une quarantaine de secondes de marge (transitions, hésitations, une question posée en cours de route). Adapte les phrases avec tes propres mots, ne les récite pas mot à mot.

| Min | Slide(s) | Ce que tu dis (idée à retenir, pas à réciter) |
|---|---|---|
| 0:00-0:35 | 1. Titre | Dis le pitch de 30 secondes (section 2.1). Regarde le jury, pas tes slides. |
| 0:35-1:00 | 2. Sommaire | Annonce très vite le plan en une phrase : "je vais présenter le contexte, la veille scientifique, les données, ma méthode, mes résultats, et les limites." |
| 1:00-1:45 | 3. Contexte et problématique | Le problème : un hôte fixe son prix sans référence objective. Question centrale : peut-on prédire le prix à partir des seules caractéristiques structurelles ? |
| 1:45-2:20 | 4. Objectifs | Va vite sur la liste des 5 objectifs, insiste sur "comparer au moins 10 modèles", "au moins 4 métriques" et "interface graphique". |
| 2:20-2:55 | 5. Veille scientifique et technique | En une phrase : "la littérature montre que les méthodes à base d'arbres (Random Forest, XGBoost) dominent sur ce type de données, avec un R² qui plafonne entre 0,5 et 0,65 sans texte ni photos — ça confirme ce que j'ai retrouvé. J'ai choisi scikit-learn et XGBoost pour le Machine Learning, Streamlit pour l'interface, et Folium spécifiquement parce que c'est la seule librairie qui permet de capter un clic utilisateur sur la carte." |
| 2:55-3:25 | 6. Dataset | Donne juste les chiffres clés : 48 895 annonces, 16 variables, 5 arrondissements, 221 quartiers. Précise à l'oral : "pas de photos ni de texte, ce qui limite la précision atteignable — j'y reviendrai." |
| 3:25-4:15 | 7. Analyse exploratoire | Montre les 2 graphiques, dis les deux constats clés (Manhattan >> Bronx, logement entier x2-3 plus cher que chambre). |
| 4:15-5:00 | 8. Prétraitement | Explique en 1 phrase chaque point : valeurs aberrantes retirées (1%), distance au centre calculée, encodage par fréquence pour les 221 quartiers. Pas besoin de détailler haversine à l'oral, garde ça pour une question. |
| 5:00-5:25 | 9. Architecture | Montre le schéma, dis juste "voici le pipeline : données brutes, nettoyage, comparaison de modèles, application". |
| 5:25-6:40 | 10. Comparaison des 12 modèles | LA slide la plus importante. Dis : "j'ai testé 12 algorithmes avec un protocole identique. Les 3 meilleurs sont tous des méthodes à base d'arbres combinés (les 3 barres coral), loin devant les modèles linéaires (à droite)." Explique en 1 phrase pourquoi (interactions non-linéaires, section 2.5). |
| 6:40-7:40 | 11. Modèle final XGBoost | Donne les 4 métriques en les traduisant : "mon modèle se trompe en moyenne de 48$ par nuit, et explique 45% de la variation du prix." Mentionne le résultat de feature importance (logement entier = 59% du poids). |
| 7:40-8:20 | 12. Analyse critique | Dis les points forts vite, puis ATTARDE-toi sur les limites — ça montre ta maturité. "Le R² de 0,45 s'explique par l'absence de photos et de texte dans les données." |
| 8:20-9:35 | 13. Démo application | Si possible, fais une VRAIE démo live plutôt que juste montrer la slide (bien plus impressionnant). Sinon, présente les 3 onglets et l'exemple de prédiction (150$ vs 118$ de moyenne Brooklyn, avec l'arrondissement déduit automatiquement du clic sur la carte). |
| 9:35-10:05 | 14. Difficultés | Choisis 2-3 difficultés max à raconter à l'oral (SVR trop lent, bug d'import corrigé), le reste sert pour les questions. |
| 10:05-11:00 | 15. Conclusion et perspectives | Reprends les objectifs atteints, cite 2 perspectives (avis textuels + photos, déploiement cloud). |
| 11:00-11:20 | 16. Merci | Remercie, invite aux questions, garde le lien GitHub affiché. |

**Conseil important** : entraîne-toi au moins 2 fois en te chronométrant. Si tu dépasses 12 minutes, coupe en premier dans les slides 7 (prétraitement, détail technique) et 13 (difficultés) — le jury peut très bien te questionner dessus après.

---

# PARTIE 5 — Questions du jury, préparées en détail

## Sur la méthodologie générale

**Q : Pourquoi avoir choisi ce sujet / ce dataset ?**
> C'est le dataset imposé dans le sujet du projet (lien Kaggle fourni), et c'est aussi un dataset de référence en Machine Learning, ce qui permet de comparer mes résultats à ceux déjà publiés par d'autres.

**Q : Quelle est la variable cible ?**
> Le prix par nuit (`price`), en dollars. C'est un problème de régression puisque c'est un nombre continu, pas une catégorie.

**Q : Comment garantissez-vous que la comparaison entre modèles est juste ?**
> Tous les modèles reçoivent exactement les mêmes variables, le même découpage train/test (avec la même graine aléatoire pour la reproductibilité), et la même validation croisée à 5 plis. C'est indispensable pour que le classement soit honnête.

**Q : Qu'est-ce qu'un pipeline scikit-learn, et pourquoi l'utiliser ?**
> C'est un enchaînement automatique d'étapes (le prétraitement puis le modèle) regroupées en un seul objet. Ça garantit que exactement les mêmes transformations (standardisation, encodage) sont appliquées à l'entraînement ET à la prédiction, ce qui évite les erreurs et rend le code plus propre et réutilisable dans l'application.

## Sur le prétraitement

**Q : Pourquoi supprimer les prix aberrants avec des percentiles plutôt qu'une règle fixe ?**
> Une règle fixe (par exemple "supprimer tout ce qui dépasse 500$") serait arbitraire et risquerait de supprimer des annonces haut de gamme parfaitement valides. Les percentiles s'adaptent à la distribution réellement observée dans les données et suppriment une proportion connue et contrôlée (1%) des deux extrêmes.

**Q : Qu'est-ce que la distance haversine, pourquoi pas une distance à vol d'oiseau classique ?**
> C'est justement une distance à vol d'oiseau, mais qui tient compte du fait que la Terre est une sphère et pas un plan plat. Sur d'aussi petites distances qu'à l'échelle de New York la différence est faible, mais c'est la formule mathématiquement correcte pour calculer une distance réelle en kilomètres entre deux coordonnées GPS.

**Q : Pourquoi un encodage par fréquence pour le quartier plutôt qu'un one-hot comme pour le type de logement ?**
> Le type de logement n'a que 3 catégories, donc un one-hot ne crée que 3 colonnes — c'est gérable. Le quartier a 221 valeurs différentes : un one-hot créerait 221 colonnes presque toutes remplies de zéros, ce qui pénalise certains modèles (KNN, SVR) et augmente le risque de sur-apprentissage. L'encodage par fréquence résume l'information en une seule colonne continue.

**Q : N'y a-t-il pas un risque avec l'encodage par fréquence (target encoding, fuite de données) ?**
> L'encodage par fréquence utilisé ici se base sur le nombre d'annonces par quartier, pas sur le prix moyen du quartier — donc il n'y a pas de fuite de l'information "prix" dans les features. Une version plus avancée utiliserait le prix moyen par quartier (target encoding), mais cela demande une validation croisée imbriquée pour éviter une fuite de données ; je l'ai identifié comme piste d'amélioration plutôt que de le faire à la légère.

## Sur les modèles

**Q : Qu'est-ce que le R² signifie concrètement ? Un R² de 0,45, c'est bon ou mauvais ?**
> Le R² mesure la part de la variation des prix expliquée par le modèle. 0,45 signifie que 45% de cette variation est expliquée par les caractéristiques utilisées. Ce n'est pas un score parfait, mais c'est cohérent avec la littérature sur ce même dataset (généralement entre 0,5 et 0,65 maximum), sachant que je n'utilise ni photos, ni texte, ni note moyenne des avis — des facteurs qui expliquent une bonne partie du prix restant.

**Q : Pourquoi XGBoost plutôt que Random Forest, leurs résultats sont presque identiques ?**
> Effectivement, les trois premiers modèles sont très proches (85,05$ vs 85,07$ vs 85,64$ de RMSE). XGBoost gagne de justesse et reste le choix le plus utilisé en pratique pour sa rapidité et sa régularisation intégrée. Le choix aurait pu se porter sur Extra Trees sans changer les conclusions générales.

**Q : Expliquez le fonctionnement de XGBoost.**
> C'est une méthode de boosting : elle construit des arbres de décision les uns après les autres. Le premier arbre fait une première estimation grossière. Chaque arbre suivant analyse les erreurs (résidus) laissées par les arbres précédents et essaie spécifiquement de les corriger, à petits pas (`learning_rate`). À la fin, on additionne les contributions de tous les arbres pour obtenir la prédiction finale.

**Q : Comment fonctionne Random Forest ?**
> On construit un grand nombre d'arbres de décision (ici 200-300), chacun entraîné sur un sous-échantillon aléatoire différent des données et des variables. Chaque arbre fait sa propre prédiction, et on prend la moyenne de toutes les prédictions. Cette diversité réduit le risque qu'un seul arbre se trompe fortement.

**Q : Le modèle est-il en sur-apprentissage ?**
> Les scores obtenus en validation croisée (sur le train) et sur le jeu de test final sont cohérents, sans écart flagrant, ce qui suggère une absence de sur-apprentissage majeur. Le réglage `max_depth=6` retenu par l'optimisation (une profondeur modérée, pas excessive) va aussi dans ce sens.

**Q : Pourquoi avoir testé un réseau de neurones si les arbres sont meilleurs ?**
> Pour le vérifier empiriquement plutôt que de le supposer. Sur des données tabulaires (des tableaux de chiffres) de cette taille, les méthodes à base d'arbres restent généralement l'état de l'art ; les réseaux de neurones ont surtout leur avantage sur de très gros volumes de données ou des données non structurées comme les images ou le texte. Mon résultat confirme empiriquement cette règle générale.

**Q : Qu'est-ce que la validation croisée apporte de plus qu'un simple train/test split ?**
> Un seul découpage peut être favorisé ou défavorisé par le hasard. La validation croisée répète l'entraînement et l'évaluation 5 fois sur des découpages différents et moyenne les résultats, ce qui donne une estimation plus stable et fiable de la performance réelle.

## Sur les limites (répondre avec assurance, ce ne sont pas des échecs)

**Q : Pourquoi le SVR est-il entraîné différemment des autres modèles ?**
> Le SVR a une complexité algorithmique qui augmente au carré, voire au cube, avec le nombre de lignes. Sur les ~38 700 lignes du jeu d'entraînement complet, son temps d'entraînement dépassait largement ce qui était raisonnable dans le temps imparti. Je l'ai donc entraîné sur un sous-échantillon aléatoire de 6000 lignes, en l'évaluant sur le même jeu de test complet que les autres modèles — une limite que j'assume et documente clairement plutôt que de la cacher.

**Q : Le modèle serait-il utilisable en production tel quel ?**
> Pas directement : les données datent de 2019 (prix non actualisés), il n'y a pas de base de données persistante dans l'application (limite de portée pédagogique), et un R² de 0,45 laisse une marge d'erreur significative. Ce serait un bon point de départ pour un outil d'aide à la décision, pas un prix garanti.

**Q : Quelles seraient les prochaines étapes pour améliorer le modèle ?**
> Intégrer les avis textuels (analyse de sentiment) et les photos (features visuelles extraites par un modèle de vision), utiliser un target encoding avec validation croisée imbriquée pour le quartier, tester du stacking entre les meilleurs modèles (combiner XGBoost, Extra Trees et Random Forest), et mettre à jour le dataset avec des données plus récentes.

**Q : Si vous deviez recommencer, que feriez-vous différemment ?**
> Je testerais probablement d'entraîner sur log(prix) plutôt que le prix brut pour stabiliser la variance des résidus, et j'essaierais un target encoding plus sophistiqué pour le quartier dès le départ plutôt que l'encodage par fréquence.

## Sur l'application

**Q : Pourquoi Streamlit plutôt que Flask/Django ou un site web classique ?**
> Streamlit permet de construire une interface interactive complète en pur Python, sans écrire de JavaScript ni construire une API séparée. C'est adapté au temps disponible pour ce projet tout en couvrant toutes les fonctionnalités demandées (exploration, entraînement, prédiction avec carte).

**Q : Pourquoi deux librairies de cartes différentes (Plotly et Folium) ?**
> Plotly est très simple pour afficher des cartes interactives (zoom, survol) en lecture seule. Mais Streamlit + Plotly ne permet pas facilement de récupérer les coordonnées d'un clic utilisateur. Folium, via la librairie `streamlit-folium`, permet justement de capter ce clic — nécessaire pour laisser l'utilisateur choisir un emplacement sur la carte dans l'onglet Test.

**Q : Que se passe-t-il si on choisit un quartier absent des données d'entraînement ?**
> L'encodage par fréquence utilisé dans l'application est calculé au niveau de l'arrondissement (moyenne des quartiers de cet arrondissement), donc la prédiction reste possible même si un quartier précis n'est pas explicitement sélectionné.

**Q : L'application garde-t-elle en mémoire les modèles entraînés ?**
> Oui, mais seulement pendant la session de l'utilisateur, grâce à `st.session_state` de Streamlit. Rien n'est sauvegardé de façon persistante entre deux sessions différentes — ce serait nécessaire pour un usage en production, mais hors du périmètre pédagogique de ce projet.

## Questions "pièges" ou de mise en difficulté

**Q : Votre R² n'est pas très élevé, votre projet n'est-il pas un échec ?**
> Non — un R² élevé n'était pas un objectif réaliste dès le départ compte tenu des données disponibles (pas de photos, pas de texte). L'objectif du projet était de mettre en place une méthodologie rigoureuse et reproductible de comparaison de modèles, ce qui a été fait avec 12 algorithmes, une validation croisée et une optimisation d'hyperparamètres. Le résultat obtenu (R²=0,45) est d'ailleurs cohérent avec ce que rapporte la littérature sur ce même dataset dans les mêmes conditions.

**Q : Avez-vous vérifié que votre modèle ne discrimine pas certains groupes (biais) ?**
> Je n'ai pas fait d'analyse de biais/équité formelle dans ce projet — c'est une limite que je peux reconnaître. Une piste d'amélioration serait d'étudier si le modèle sur- ou sous-estime systématiquement les prix pour certains arrondissements ou hôtes, en analysant les résidus par sous-groupe.

**Q : Comment savez-vous que vos résultats sont reproductibles ?**
> J'ai fixé une graine aléatoire (`random_state=42`) pour le découpage train/test et pour tous les modèles qui en ont besoin, ce qui garantit qu'en relançant le code on obtient exactement les mêmes résultats. Le code est aussi versionné sur GitHub avec les scripts de prétraitement, d'entraînement et l'application, ce qui permet à n'importe qui de reproduire l'ensemble du pipeline.

---

# PARTIE 6 — Conseils pour le jour J

1. **Entraîne-toi à voix haute au moins 2 fois avec un chronomètre.** 12 minutes, c'est court — la première fois tu dépasseras sûrement, c'est normal.
2. **Ouvre l'application et charge le meilleur modèle avant même de commencer ta présentation**, pour ne rien perdre de temps devant le jury si tu fais une démo live.
3. Si une question te bloque complètement, dis honnêtement : *"C'est une limite que j'ai identifiée mais pas explorée en détail dans le temps imparti ; une piste serait de..."* — c'est **beaucoup mieux vu** que d'inventer une réponse fausse.
4. **N'aie pas peur d'assumer le R² de 0,45.** Le jury valorise la lucidité et l'esprit critique bien plus qu'un chiffre "parfait" présenté sans recul. Un projet qui reconnaît ses limites est perçu comme plus sérieux qu'un projet qui prétend n'en avoir aucune.
5. Garde en tête la structure globale si tu perds le fil : **Contexte → Objectifs → Données → Méthode → Résultats → Limites → Perspectives.**
6. Relis ce guide une dernière fois la veille au soir, pas le matin même — pour arriver reposée plutôt que sur-stressée à essayer de tout mémoriser en dernière minute.
