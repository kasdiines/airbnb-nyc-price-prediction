"""
Analyse exploratoire (EDA) : statistiques descriptives + visualisations.
Genere les figures utilisees dans le rapport (reports/figures/).
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
FIG_DIR = Path(__file__).resolve().parent.parent / "reports" / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

sns.set_theme(style="whitegrid")


def main():
    df = pd.read_csv(DATA_DIR / "airbnb_clean.csv")

    # 1. Distribution des prix
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))
    sns.histplot(df["price"], bins=60, ax=axes[0], color="#2563eb")
    axes[0].set_title("Distribution du prix (nettoye)")
    axes[0].set_xlabel("Prix ($)")
    sns.histplot(df["log_price"], bins=60, ax=axes[1], color="#16a34a")
    axes[1].set_title("Distribution du log(prix+1)")
    axes[1].set_xlabel("log(prix + 1)")
    plt.tight_layout()
    plt.savefig(FIG_DIR / "01_distribution_prix.png", dpi=150)
    plt.close()

    # 2. Boxplot prix par arrondissement (neighbourhood_group)
    plt.figure(figsize=(9, 5))
    order = df.groupby("neighbourhood_group")["price"].median().sort_values(ascending=False).index
    sns.boxplot(data=df, x="neighbourhood_group", y="price", order=order, showfliers=False)
    plt.title("Prix par arrondissement (sans valeurs extremes)")
    plt.xlabel("Arrondissement")
    plt.ylabel("Prix ($)")
    plt.tight_layout()
    plt.savefig(FIG_DIR / "02_boxplot_prix_arrondissement.png", dpi=150)
    plt.close()

    # 3. Boxplot prix par type de logement
    plt.figure(figsize=(8, 5))
    sns.boxplot(data=df, x="room_type", y="price", showfliers=False)
    plt.title("Prix par type de logement")
    plt.tight_layout()
    plt.savefig(FIG_DIR / "03_boxplot_prix_room_type.png", dpi=150)
    plt.close()

    # 4. Heatmap des correlations
    num_cols = [
        "price", "minimum_nights", "number_of_reviews", "reviews_per_month",
        "calculated_host_listings_count", "availability_365", "distance_center_km",
        "days_since_last_review", "neighbourhood_freq",
    ]
    corr = df[num_cols].corr()
    plt.figure(figsize=(9, 7))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0)
    plt.title("Matrice de correlation")
    plt.tight_layout()
    plt.savefig(FIG_DIR / "04_heatmap_correlations.png", dpi=150)
    plt.close()

    # 5. Carte geographique (scatter lat/lon colore par prix)
    plt.figure(figsize=(8, 8))
    sample = df.sample(min(8000, len(df)), random_state=42)
    sc = plt.scatter(
        sample["longitude"], sample["latitude"], c=sample["log_price"],
        cmap="viridis", s=6, alpha=0.6,
    )
    plt.colorbar(sc, label="log(prix + 1)")
    plt.title("Repartition geographique des annonces (couleur = prix)")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    plt.tight_layout()
    plt.savefig(FIG_DIR / "05_carte_prix.png", dpi=150)
    plt.close()

    # 6. Distance au centre vs prix
    plt.figure(figsize=(7, 5))
    sns.regplot(
        data=sample, x="distance_center_km", y="log_price",
        scatter_kws={"s": 6, "alpha": 0.4}, line_kws={"color": "red"},
    )
    plt.title("Distance au centre de Manhattan vs log(prix)")
    plt.tight_layout()
    plt.savefig(FIG_DIR / "06_distance_vs_prix.png", dpi=150)
    plt.close()

    # Statistiques descriptives -> CSV pour le rapport
    desc = df.describe(include="all").transpose()
    desc.to_csv(FIG_DIR.parent / "stats_descriptives.csv")

    group_stats = df.groupby("neighbourhood_group")["price"].agg(["count", "mean", "median", "std"])
    group_stats.to_csv(FIG_DIR.parent / "stats_par_arrondissement.csv")

    print("Figures generees dans", FIG_DIR)


if __name__ == "__main__":
    main()
