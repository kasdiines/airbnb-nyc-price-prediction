# Prédiction des prix de location Airbnb — New York City

Projet de Machine Learning visant à prédire le prix d'une annonce Airbnb à New York
en fonction de ses caractéristiques (localisation, type de logement, disponibilité,
popularité), avec une interface graphique interactive.

Dataset : [New York City Airbnb Open Data](https://www.kaggle.com/datasets/arthbr11/new-york-city-airbnb-open-data/data) (Kaggle).

## Structure du projet

```
Airbnb/
├── data/                  # Données brutes et nettoyées
├── src/
│   ├── preprocessing.py   # Nettoyage, feature engineering, encodage
│   ├── eda.py              # Analyse exploratoire (figures + stats)
│   └── train_models.py     # Comparaison de 10+ modèles, tuning, sauvegarde
├── app/
│   └── app.py              # Interface graphique Streamlit
├── models/                 # Modèle entraîné sauvegardé (best_model.joblib)
├── reports/
│   ├── figures/             # Graphiques générés par eda.py
│   ├── model_comparison.csv
│   └── tuning_results.json
└── requirements.txt
```

## Installation

```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

## Utilisation

```bash
# 1. Prétraitement des données
python src/preprocessing.py

# 2. Analyse exploratoire (génère les figures dans reports/figures/)
python src/eda.py

# 3. Comparaison des modèles et optimisation des hyperparamètres
python src/train_models.py

# 4. Lancer l'interface graphique
streamlit run app/app.py
```

## Fonctionnalités de l'interface graphique

- **Exploration des données** : chargement, statistiques descriptives, distribution
  des prix, boxplots par arrondissement, carte géographique des annonces.
- **Entraînement / choix du modèle** : sélection de l'algorithme, paramétrage,
  entraînement, affichage des métriques (RMSE, MAE, R², MAPE).
- **Test** : saisie des caractéristiques d'un logement, prédiction du prix en temps
  réel, localisation sur carte, comparaison avec le prix moyen de l'arrondissement,
  affichage des logements disponibles autour de la zone choisie.

## Rapport

Le rapport complet du projet se trouve dans `reports/rapport_projet.docx`.
