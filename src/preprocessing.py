"""
Pretraitement du dataset NYC Airbnb.
Nettoyage, gestion des valeurs manquantes, feature engineering, encodage.
"""
import numpy as np
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RAW_PATH = DATA_DIR / "AB_NYC_2019.csv"
CLEAN_PATH = DATA_DIR / "airbnb_clean.csv"

# Centre approximatif de Manhattan (Times Square), utilise comme reference
# pour la feature de distance.
CENTER_LAT, CENTER_LON = 40.7580, -73.9855


def haversine_distance(lat1, lon1, lat2, lon2):
    """Distance en km entre deux points GPS (formule de haversine)."""
    r = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


def load_raw(path: Path = RAW_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def clean_and_engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # --- Gestion des valeurs manquantes ---
    df["reviews_per_month"] = df["reviews_per_month"].fillna(0)
    df["name"] = df["name"].fillna("")
    df["host_name"] = df["host_name"].fillna("")

    # last_review manquant -> jamais reçu d'avis
    df["has_reviews"] = df["number_of_reviews"] > 0
    ref_date = pd.to_datetime(df["last_review"]).max()
    df["last_review_parsed"] = pd.to_datetime(df["last_review"])
    df["days_since_last_review"] = (ref_date - df["last_review_parsed"]).dt.days
    # Pas d'avis -> on impute par la valeur max observee (annonce "dormante")
    max_days = df["days_since_last_review"].max()
    df["days_since_last_review"] = df["days_since_last_review"].fillna(max_days)

    # --- Suppression des prix aberrants ---
    before = len(df)
    df = df[df["price"] > 0]
    q_low, q_high = df["price"].quantile([0.005, 0.995])
    df = df[(df["price"] >= q_low) & (df["price"] <= q_high)]
    removed = before - len(df)
    print(f"Prix aberrants supprimes : {removed} lignes ({removed/before:.2%})")

    # minimum_nights aberrant (ex: 1250 nuits minimum)
    df = df[df["minimum_nights"] <= 365]

    # --- Feature engineering ---
    df["distance_center_km"] = haversine_distance(
        df["latitude"], df["longitude"], CENTER_LAT, CENTER_LON
    )
    df["log_price"] = np.log1p(df["price"])
    df["reviews_per_listing"] = df["number_of_reviews"] / (
        df["calculated_host_listings_count"].clip(lower=1)
    )
    df["is_multi_listing_host"] = (df["calculated_host_listings_count"] > 1).astype(int)
    df["availability_ratio"] = df["availability_365"] / 365.0

    # Encodage frequence pour 'neighbourhood' (forte cardinalite ~220 valeurs)
    freq = df["neighbourhood"].value_counts(normalize=True)
    df["neighbourhood_freq"] = df["neighbourhood"].map(freq)

    # Prix moyen par quartier (arrondissement) - utilise par l'app pour la comparaison
    df["neighbourhood_group_avg_price"] = df.groupby("neighbourhood_group")["price"].transform("mean")

    keep_cols = [
        "id", "neighbourhood_group", "neighbourhood", "latitude", "longitude",
        "room_type", "price", "log_price", "minimum_nights", "number_of_reviews",
        "reviews_per_month", "calculated_host_listings_count", "availability_365",
        "availability_ratio", "has_reviews", "days_since_last_review",
        "distance_center_km", "reviews_per_listing", "is_multi_listing_host",
        "neighbourhood_freq", "neighbourhood_group_avg_price",
    ]
    return df[keep_cols].reset_index(drop=True)


def main():
    df = load_raw()
    print(f"Dataset brut : {df.shape}")
    clean = clean_and_engineer(df)
    print(f"Dataset nettoye : {clean.shape}")
    clean.to_csv(CLEAN_PATH, index=False)
    print(f"Sauvegarde -> {CLEAN_PATH}")


if __name__ == "__main__":
    main()
