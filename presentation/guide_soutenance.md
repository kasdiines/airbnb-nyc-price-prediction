# Guide de soutenance — Prédiction des prix Airbnb NYC

Ce document t'explique **tout** le projet en profondeur, pas juste ce qu'il fait mais **pourquoi** chaque choix a été fait, pour que tu puisses répondre à n'importe quelle question du jury sans être prise au dépourvu. Lis-le en entier au moins une fois, puis relis la section "Questions probables" juste avant la soutenance.

---

## 1. Le pitch en 30 secondes (à savoir par cœur)

> "Mon projet prédit le prix d'une annonce Airbnb à New York à partir de ses caractéristiques — localisation, type de logement, disponibilité, popularité — sans utiliser les photos ni le texte de l'annonce. J'ai comparé 12 algorithmes de Machine Learning avec un protocole rigoureux et identique pour tous, optimisé les hyperparamètres des trois meilleurs, et développé une interface Streamlit qui permet d'explorer les données, d'entraîner un modèle au choix, et de tester une prédiction en temps réel avec visualisation sur carte. Le meilleur modèle, XGBoost optimisé, explique 45 % de la variance du prix avec une erreur moyenne d'environ 48 dollars par nuit."

---

## 2. Comprendre le fil du projet, étape par étape

### 2.1 Le dataset

- **Source** : Kaggle, *New York City Airbnb Open Data* — c'est le dataset exact demandé dans le sujet.
- **48 895 annonces brutes**, **16 colonnes** : id, host_id, neighbourhood_group (arrondissement), neighbourhood (quartier), latitude/longitude, room_type, price, minimum_nights, number_of_reviews, last_review, reviews_per_month, calculated_host_listings_count, availability_365.
- **Pourquoi ce dataset est difficile** : il n'y a **aucune photo, aucun texte de description, aucune note moyenne d'avis**. On prédit un prix uniquement à partir de données structurées. C'est une limite qu'il faut assumer et expliquer, pas cacher.

**Si le jury demande "pourquoi ce dataset ?"** → C'est celui imposé par le sujet (lien Kaggle fourni), en plus c'est un dataset de référence largement utilisé en Machine Learning, ce qui permet de comparer tes résultats à la littérature existante.

### 2.2 Le prétraitement (`src/preprocessing.py`)

Quatre opérations, dans cet ordre :

1. **Valeurs manquantes** :
   - `reviews_per_month` → remplacé par 0 (une annonce sans avis récent a naturellement 0 avis/mois, ce n'est pas une donnée "manquante" au sens strict).
   - `last_review` manquant → on crée une variable `has_reviews` (vrai/faux) et on impute `days_since_last_review` par la valeur maximale observée, ce qui revient à dire "cette annonce n'a jamais eu d'avis, elle est aussi ancienne que possible dans le dataset".

2. **Valeurs aberrantes** :
   - On supprime les prix ≤ 0 (non valides) et les prix hors de l'intervalle [0,5 % ; 99,5 %] de la distribution (donc les 1 % de prix les plus extrêmes des deux côtés).
   - On supprime les `minimum_nights` > 365 (certaines annonces demandaient jusqu'à 1250 nuits minimum — clairement des erreurs de saisie ou des annonces désactivées).
   - Résultat : 492 lignes supprimées sur 48 895 (1,01 %).

   **Pourquoi des percentiles et pas une valeur fixe (ex: prix < 1000$) ?** → Les percentiles s'adaptent à la distribution réelle des données plutôt que d'imposer un seuil arbitraire ; c'est une méthode statistique standard et défendable.

3. **Feature engineering** (création de nouvelles variables) :
   - `distance_center_km` : distance à vol d'oiseau (formule de **haversine**, qui tient compte de la courbure de la Terre) entre chaque annonce et le centre de Manhattan (Times Square). C'est la variable géographique la plus corrélée au prix après le type de logement.
   - `log_price` : transformation logarithmique du prix, utile uniquement pour les graphiques (la distribution du prix est très asymétrique).
   - `availability_ratio` : `availability_365 / 365`, un ratio plus facile à interpréter que le nombre brut de jours.
   - `reviews_per_listing` : nombre d'avis rapporté au nombre d'annonces de l'hôte (un hôte avec 10 annonces qui a 50 avis au total n'est pas dans la même situation qu'un hôte avec 1 annonce et 50 avis).
   - `is_multi_listing_host` : indicateur binaire (l'hôte a-t-il plusieurs annonces ? souvent signe d'une activité professionnelle plutôt que d'un particulier).
   - `neighbourhood_freq` : voir encodage ci-dessous.

4. **Encodage des variables catégorielles** :
   - `room_type` (3 valeurs : Entire home/apt, Private room, Shared room) et `neighbourhood_group` (5 arrondissements) → **one-hot encoding** (une colonne binaire par catégorie). C'est possible car il y a peu de catégories.
   - `neighbourhood` (**221 quartiers différents**) → un one-hot créerait 221 colonnes creuses (beaucoup de zéros), ce qui pénalise certains modèles (KNN, SVR) et augmente le risque de sur-apprentissage. **Solution retenue : encodage par fréquence** — chaque quartier est remplacé par la proportion d'annonces qui s'y trouvent. Un quartier très demandé (Williamsburg) aura une valeur différente d'un quartier rare.

   **Si le jury demande "pourquoi pas un target encoding (moyenne du prix par quartier) ?"** → C'est une technique plus puissante mais qui risque une fuite de données (*data leakage*) si elle n'est pas calculée uniquement sur le jeu d'entraînement avec validation croisée imbriquée. Par souci de simplicité et de robustesse dans le temps imparti, l'encodage par fréquence a été préféré ; c'est explicitement noté comme piste d'amélioration dans le rapport.

### 2.3 L'analyse exploratoire (`src/eda.py`)

Sert à **comprendre les données avant de modéliser**. Les résultats clés :

- **Distribution du prix** : très asymétrique (beaucoup d'annonces autour de 70-100$, une longue traîne jusqu'à 1000$). Moyenne 141,9$, médiane 106$ (la moyenne > médiane confirme l'asymétrie).
- **Prix par arrondissement** : Manhattan (149,5$ médian) >> Brooklyn (91$) > Queens/Staten Island (75$) > Bronx (68$).
- **Prix par type de logement** : Entire home/apt (160$ médian) >> Private room (70$) > Shared room (~45$).
- **Corrélations** : `distance_center_km` a la corrélation la plus forte avec le prix parmi les variables numériques (-0,31 : plus on s'éloigne du centre, moins c'est cher), mais reste modérée — ce qui annonce déjà que le modèle ne pourra pas tout expliquer avec ces seules variables.

**Pourquoi ces graphiques et pas d'autres ?** → Boxplot pour comparer des groupes (arrondissement, type de logement) sans être perturbé par les valeurs extrêmes ; heatmap de corrélation pour repérer rapidement les variables numériques les plus utiles avant même de faire tourner un modèle ; carte géographique pour visualiser l'effet spatial directement.

### 2.4 La comparaison des modèles (`src/train_models.py`)

**Protocole identique pour les 12 modèles** (condition indispensable pour une comparaison honnête) :
- Même jeu de variables (13 numériques + 2 catégorielles encodées).
- Même découpage train/test : 80 % / 20 %, avec une graine aléatoire fixée (`random_state=42`) pour que le découpage soit reproductible.
- Validation croisée à **5 plis** (`KFold`) sur le jeu d'entraînement, pour vérifier que la performance n'est pas due au hasard d'un seul découpage.

**Les 12 modèles, et pourquoi ils sont là** :

| Modèle | Famille | Pourquoi il est inclus |
|---|---|---|
| Régression linéaire, Ridge, Lasso, ElasticNet | Linéaires (régularisés) | Baseline simple et interprétable — sert de référence pour mesurer le gain des modèles plus complexes |
| KNN | Proximité | Capture des relations non linéaires locales sans hypothèse sur la forme de la relation |
| Arbre de décision | Arbre unique | Interprétable, mais sert surtout à montrer l'intérêt des méthodes d'ensemble qui le surpassent |
| Random Forest, Extra Trees | Ensembles (bagging) | Combinent de nombreux arbres pour réduire le sur-apprentissage |
| Gradient Boosting, XGBoost | Ensembles (boosting) | Construisent les arbres séquentiellement pour corriger les erreurs précédentes — état de l'art sur données tabulaires |
| SVR | Support Vector | Robuste aux valeurs extrêmes avec le bon noyau, complète le panel de familles testées |
| MLP (réseau de neurones) | Deep Learning simple | Pour vérifier si un réseau de neurones apporte un gain sur ce volume de données (réponse : non, pas ici) |

**Résultat (classement par RMSE, test)** :

1. XGBoost — 85,05 $
2. Extra Trees — 85,07 $
3. Random Forest — 85,64 $
4. Gradient Boosting — 87,55 $
5. MLP — 88,46 $
6. KNN — 89,22 $
7. SVR — 93,20 $
8. Arbre de décision — 93,59 $
9-10. Régression linéaire / Ridge — 93,65 $
11. Lasso — 93,95 $
12. ElasticNet — 98,08 $

**Constat central à savoir expliquer** : les modèles à base d'arbres d'ensemble (XGBoost, Extra Trees, Random Forest) dominent nettement. Cela s'explique car la relation entre prix et caractéristiques est **non linéaire** et comporte des **interactions** (ex : l'effet du type de logement dépend de l'arrondissement) que les modèles linéaires ne peuvent pas capturer par construction. Le MLP ne fait pas mieux que les arbres : sur des données **tabulaires** de taille moyenne (48 000 lignes), les méthodes à base d'arbres restent généralement supérieures aux réseaux de neurones — ce n'est que sur de très gros volumes ou des données non structurées (images, texte) que le deep learning prend l'avantage.

### 2.5 L'optimisation des hyperparamètres

- On ne réoptimise que les **3 meilleurs modèles** (XGBoost, Extra Trees, Random Forest) — inutile de chercher à optimiser un modèle déjà loin derrière.
- Méthode : **RandomizedSearchCV** (12 combinaisons aléatoires testées, validation croisée à 3 plis).

  **Pourquoi Randomized et pas GridSearch (recherche exhaustive) ?** → GridSearch teste absolument toutes les combinaisons, ce qui devient très coûteux en temps quand il y a plusieurs hyperparamètres avec plusieurs valeurs chacun. RandomizedSearchCV échantillonne aléatoirement dans l'espace des hyperparamètres et trouve en général une solution presque aussi bonne pour une fraction du temps de calcul.

- **Résultat final** : XGBoost avec `n_estimators=400, max_depth=6, learning_rate=0.03, subsample=0.7` → RMSE 84,49 $ (contre 85,05 $ par défaut), R² 0,453.

  **Le gain est faible (0,66 %) — pourquoi le mentionner quand même ?** → Parce que c'est honnête : cela montre que les valeurs par défaut de scikit-learn/XGBoost sont déjà bien calibrées, et que le principal levier de performance est le **choix de la famille de modèle**, pas le réglage fin. C'est une observation scientifique valable, pas un échec.

### 2.6 L'importance des variables (feature importance)

Sur le modèle XGBoost final : la variable **`room_type = Entire home/apt`** (logement entier) domine avec **59,5 %** de l'importance totale — de très loin devant `distance_center_km` (4,5 %) et `longitude` (3,7 %).

**Ce que ça veut dire concrètement** : le type de logement est, statistiquement, le facteur le plus déterminant du prix — bien plus que la localisation. Cela confirme quantitativement ce qu'on observait déjà visuellement dans l'analyse exploratoire (le boxplot par room_type montrait déjà un facteur x2-3).

### 2.7 L'application Streamlit (`app/app.py`)

**Pourquoi Streamlit et pas Flask/Django/React ?** → Parce qu'on reste en pur Python : pas besoin d'écrire du JavaScript ou une API séparée, l'intégration avec pandas/scikit-learn/plotly est directe, et on peut construire une interface complète et interactive en quelques centaines de lignes, ce qui est adapté au temps imparti pour ce projet.

Trois onglets :

1. **Exploration des données** : statistiques, histogramme des prix, boxplot par arrondissement, carte des annonces (`plotly.express.scatter_mapbox`).
2. **Entraînement / choix du modèle** : l'utilisateur choisit un modèle parmi 9, règle ses hyperparamètres avec des curseurs, lance l'entraînement, voit les 4 métriques et un graphique prix réel vs prix prédit. Un bouton permet aussi de charger directement le meilleur modèle du benchmark complet (le XGBoost optimisé sauvegardé).
3. **Test / Prédiction** : l'utilisateur clique sur une carte (**Folium**, via `streamlit-folium`, qui permet de récupérer les coordonnées du clic — Plotly seul ne le permet pas nativement) pour choisir un emplacement, remplit un formulaire (type de logement, nuits minimum, avis, etc.), et obtient une prédiction de prix en temps réel, comparée au prix moyen de l'arrondissement, avec affichage des annonces existantes les plus proches sur une carte.

**Pourquoi deux librairies de cartes différentes (Plotly et Folium) ?** → Plotly est plus simple pour de l'affichage statique interactif (zoom, survol). Folium/streamlit-folium est nécessaire spécifiquement pour capter un **clic utilisateur** avec ses coordonnées GPS, fonctionnalité que Plotly ne permet pas facilement dans Streamlit.

---

## 3. Questions probables du jury — et comment y répondre

### Sur la méthodologie générale

**Q : Pourquoi avoir choisi ce sujet / ce dataset ?**
> C'est le dataset imposé dans le sujet du projet, un dataset de référence en Machine Learning ce qui permet de comparer mes résultats à la littérature existante.

**Q : Quelle est la variable cible ? Pourquoi ne pas prédire log(prix) directement ?**
> La cible est `price` en dollars. J'ai calculé `log_price` pour l'analyse visuelle (la distribution du prix est très asymétrique, le log la rend plus lisible), mais les modèles sont entraînés directement sur `price` pour que les métriques d'erreur (RMSE, MAE) soient directement interprétables en dollars. C'est une piste d'amélioration possible : entraîner sur log(price) peut stabiliser la variance des résidus pour les modèles linéaires.

**Q : Comment garantissez-vous que la comparaison entre modèles est juste ?**
> Même jeu de variables, même découpage train/test avec la même graine aléatoire, même validation croisée à 5 plis pour tous les modèles sauf le SVR (voir limite ci-dessous).

### Sur le prétraitement

**Q : Pourquoi supprimer les prix aberrants avec des percentiles plutôt qu'une règle métier (ex : Airbnb NYC va rarement au-dessus de 500$/nuit) ?**
> Une règle métier fixe serait arbitraire et pourrait supprimer des annonces haut de gamme légitimes. Les percentiles s'adaptent aux données réellement observées et suppriment une proportion connue et contrôlée (1 %) des deux côtés de la distribution.

**Q : L'imputation par 0 pour reviews_per_month, n'est-ce pas risqué ?**
> Non : une absence d'avis récent signifie littéralement 0 avis par mois, ce n'est pas une vraie valeur manquante au sens statistique — contrairement à `last_review` où l'absence de date nécessite une vraie décision d'imputation (traitée séparément avec `has_reviews` et `days_since_last_review`).

**Q : Qu'est-ce que la distance haversine, pourquoi pas une distance euclidienne classique ?**
> La Terre est une sphère, pas un plan. Sur de petites distances comme à l'échelle de New York, la différence est faible, mais haversine est la formule standard et correcte pour calculer une distance réelle en kilomètres à partir de coordonnées latitude/longitude — c'est aussi plus rigoureux à présenter devant un jury.

### Sur les modèles

**Q : Qu'est-ce que le R² signifie concrètement ? Un R² de 0,45, c'est bon ou mauvais ?**
> Le R² mesure la proportion de la variance du prix expliquée par le modèle (1 = parfait, 0 = pas mieux que prédire la moyenne). Un R² de 0,45 signifie que 45 % de la variation des prix est expliquée par les caractéristiques utilisées. Ce n'est pas un score parfait, mais c'est cohérent avec la littérature sur ce même dataset (qui rapporte généralement 0,5 à 0,65 maximum) sachant qu'on n'utilise ni photos ni texte ni note moyenne d'avis — une part significative du prix dépend de facteurs non mesurés (qualité perçue, décoration, négociation de l'hôte).

**Q : Pourquoi XGBoost plutôt que Random Forest, ils ont des résultats très proches ?**
> Effectivement les trois premiers modèles (XGBoost, Extra Trees, Random Forest) sont très proches (85,05 vs 85,07 vs 85,64 $ de RMSE). XGBoost gagne de justesse, et reste le choix le plus classique en pratique pour sa rapidité et sa gestion native de la régularisation. Le choix aurait pu tout aussi bien se porter sur Extra Trees sans changer fondamentalement les conclusions.

**Q : Comment fonctionne XGBoost en une phrase ?**
> C'est une méthode de *boosting* : elle construit des arbres de décision les uns après les autres, chaque nouvel arbre cherchant à corriger les erreurs (résidus) des arbres précédents, avec une pénalisation (régularisation) qui évite le sur-apprentissage.

**Q : Qu'est-ce que la validation croisée et pourquoi c'est important ?**
> Plutôt que d'évaluer un modèle sur un seul découpage train/test (qui peut être favorable ou défavorable par hasard), on découpe les données d'entraînement en 5 parties (plis) : on entraîne 5 fois en laissant à chaque fois un pli différent de côté pour l'évaluation, puis on moyenne les résultats. Ça donne une estimation plus fiable et plus stable de la performance réelle du modèle.

**Q : Le modèle est-il en situation de sur-apprentissage (overfitting) ?**
> Les scores de validation croisée (sur le train) et les scores sur le jeu de test sont cohérents (pas d'écart flagrant), ce qui suggère une absence de sur-apprentissage majeur. Les hyperparamètres optimaux trouvés (`max_depth=6`, profondeur modérée) vont aussi dans ce sens — un modèle qui sur-apprend a généralement besoin d'une profondeur excessive pour "mémoriser" les données d'entraînement.

**Q : Pourquoi avoir testé un réseau de neurones si les arbres sont meilleurs ?**
> Pour vérifier empiriquement, et non supposer, que le deep learning n'apporte pas d'avantage ici. C'est une donnée scientifique importante : sur des données tabulaires de cette taille, les méthodes à base d'arbres restent généralement l'état de l'art — un réseau de neurones a besoin de beaucoup plus de données ou de features engineering spécifique (embeddings) pour rivaliser.

### Sur les limites (soyez directe et assumée, ne pas se justifier à l'excès)

**Q : Pourquoi le SVR est-il entraîné différemment des autres modèles ?**
> Le SVR a une complexité algorithmique quadratique à cubique en fonction du nombre de lignes. Sur les ~38 700 lignes du jeu d'entraînement complet, son temps d'entraînement dépassait largement ce qui était raisonnable pour ce projet. Je l'ai donc entraîné sur un sous-échantillon aléatoire de 6000 lignes, tout en l'évaluant sur le même jeu de test complet que les autres modèles — c'est une limite que j'assume et documente explicitement plutôt que de la dissimuler.

**Q : Le modèle serait-il utilisable en production tel quel ?**
> Pas directement : les données datent de 2019 (prix non actualisés), il n'y a pas de base de données persistante dans l'application (limite de portée pédagogique du projet), et le R² de 0,45 signifie qu'une marge d'erreur significative subsiste. Ce serait un bon point de départ pour un outil d'aide à la décision, pas un prix définitif.

**Q : Quelles seraient les prochaines étapes pour améliorer le modèle ?**
> Intégrer les avis textuels (analyse de sentiment) et les photos (features visuelles via un modèle de vision), utiliser un target encoding avec validation croisée imbriquée pour le quartier, tester du stacking entre les meilleurs modèles, et mettre à jour le dataset avec des données plus récentes.

### Sur l'application

**Q : Pourquoi l'app ne sauvegarde pas les modèles entraînés par l'utilisateur ?**
> Streamlit garde l'état en mémoire pendant la session via `st.session_state`, ce qui suffit pour une démonstration interactive. Persister les modèles entraînés par chaque utilisateur nécessiterait une base de données ou un système de fichiers partagé, hors du périmètre pédagogique de ce projet.

**Q : Que se passe-t-il si je choisis un quartier qui n'existe pas dans les données d'entraînement ?**
> L'encodage par fréquence (`neighbourhood_freq`) est calculé au niveau de l'arrondissement dans l'application (moyenne des fréquences des quartiers de cet arrondissement), donc la prédiction reste possible même sans sélectionner un quartier précis inconnu du modèle.

---

## 4. Petit glossaire (à maîtriser, pas à réciter)

- **RMSE (Root Mean Squared Error)** : racine carrée de la moyenne des erreurs au carré. Pénalise plus fortement les grosses erreurs. Exprimée dans l'unité de la cible (ici, en dollars).
- **MAE (Mean Absolute Error)** : moyenne des erreurs absolues. Plus facile à interpréter ("le modèle se trompe en moyenne de X dollars"), moins sensible aux valeurs extrêmes que la RMSE.
- **R² (coefficient de détermination)** : proportion de variance expliquée par le modèle, entre 0 et 1 (peut être négatif si le modèle est pire que la moyenne).
- **MAPE (Mean Absolute Percentage Error)** : erreur moyenne en pourcentage du prix réel — utile pour comparer des annonces de prix très différents.
- **Validation croisée (cross-validation)** : technique d'évaluation qui découpe les données en plusieurs parties pour obtenir une estimation plus fiable de la performance.
- **Hyperparamètre** : paramètre de configuration d'un modèle fixé avant l'entraînement (ex : nombre d'arbres, profondeur maximale), par opposition aux paramètres appris automatiquement pendant l'entraînement.
- **Overfitting (sur-apprentissage)** : quand un modèle apprend "par cœur" les données d'entraînement, y compris leur bruit, et généralise mal à de nouvelles données.
- **One-hot encoding** : transformation d'une variable catégorielle en plusieurs colonnes binaires (une par catégorie).
- **Feature engineering** : création de nouvelles variables à partir des données brutes pour améliorer la performance d'un modèle.
- **Pipeline (scikit-learn)** : enchaînement automatisé et reproductible d'étapes de prétraitement + modèle, qui garantit que les mêmes transformations sont appliquées à l'entraînement et à la prédiction.

---

## 5. Conseils pour le jour J

1. **Ouvre l'application avant la soutenance** et charge le meilleur modèle (bouton dans l'onglet 2) pour ne pas perdre de temps devant le jury.
2. Prépare une prédiction "toute faite" (par exemple Manhattan, Entire home/apt) pour la démo, plutôt que d'improviser en direct.
3. Si une question te bloque, il vaut mieux dire *"C'est une limite que j'ai identifiée mais pas explorée en détail, une piste serait de..."* plutôt que d'inventer une réponse.
4. N'aie pas peur de dire que le R² de 0,45 est modéré : le jury valorise la lucidité et l'analyse critique bien plus qu'un chiffre "parfait" présenté sans recul.
5. Garde en tête la structure : Contexte → Objectifs → Méthodologie → Résultats → Limites → Perspectives. Si tu perds le fil d'une question, reviens à cette structure.
