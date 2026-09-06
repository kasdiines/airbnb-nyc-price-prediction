"""
Interface graphique Streamlit - Prediction des prix Airbnb NYC.

Onglets :
 1. Exploration des donnees (chargement, statistiques, graphiques)
 2. Entrainement / choix du modele (parametrage, entrainement, metriques)
 3. Test (saisie utilisateur, prediction, carte, comparaison arrondissement)
"""
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import streamlit as st
import plotly.express as px
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, ExtraTreesRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from xgboost import XGBRegressor
import folium
from streamlit_folium import st_folium

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

DATA_PATH = BASE_DIR / "data" / "airbnb_clean.csv"
MODELS_DIR = BASE_DIR / "models"

NUM_FEATURES = [
    "minimum_nights", "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365", "availability_ratio",
    "distance_center_km", "days_since_last_review", "reviews_per_listing",
    "is_multi_listing_host", "neighbourhood_freq", "latitude", "longitude",
]
CAT_FEATURES = ["neighbourhood_group", "room_type"]
TARGET = "price"

st.set_page_config(page_title="Airbnb NYC - Prediction de prix", layout="wide")


@st.cache_data
def load_data():
    return pd.read_csv(DATA_PATH)


def build_pipeline(model_name, params):
    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), NUM_FEATURES),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES),
    ])
    models = {
        "Regression lineaire": LinearRegression(),
        "Ridge": Ridge(alpha=params.get("alpha", 1.0)),
        "Lasso": Lasso(alpha=params.get("alpha", 1.0), max_iter=5000),
        "KNN": KNeighborsRegressor(n_neighbors=params.get("n_neighbors", 15)),
        "Random Forest": RandomForestRegressor(
            n_estimators=params.get("n_estimators", 200),
            max_depth=params.get("max_depth", 15),
            random_state=42, n_jobs=-1,
        ),
        "Extra Trees": ExtraTreesRegressor(
            n_estimators=params.get("n_estimators", 200),
            max_depth=params.get("max_depth", 15),
            random_state=42, n_jobs=-1,
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=params.get("n_estimators", 200),
            max_depth=params.get("max_depth", 3),
            learning_rate=params.get("learning_rate", 0.1),
            random_state=42,
        ),
        "XGBoost": XGBRegressor(
            n_estimators=params.get("n_estimators", 300),
            max_depth=params.get("max_depth", 6),
            learning_rate=params.get("learning_rate", 0.08),
            random_state=42, n_jobs=-1, verbosity=0,
        ),
        "SVR": SVR(C=params.get("C", 50)),
    }
    model = models[model_name]
    return Pipeline([("prep", preprocessor), ("model", model)])


st.title("Prediction des prix de location Airbnb - New York City")

tab1, tab2, tab3 = st.tabs([
    "Exploration des donnees", "Entrainement / choix du modele", "Test / Prediction",
])

df = load_data()

# ----------------------------------------------------------------------
with tab1:
    st.header("Exploration des donnees")

    if st.button("Recharger les donnees"):
        st.cache_data.clear()
        df = load_data()

    st.write(f"Nombre d'annonces : **{len(df):,}**")
    st.dataframe(df.head(20))

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Statistiques descriptives")
        st.dataframe(df[["price", "minimum_nights", "number_of_reviews",
                          "availability_365", "distance_center_km"]].describe())
    with col2:
        st.subheader("Prix moyen par arrondissement")
        st.dataframe(df.groupby("neighbourhood_group")["price"].agg(["count", "mean", "median"]))

    st.subheader("Distribution des prix")
    fig = px.histogram(df, x="price", nbins=60, title="Distribution du prix")
    st.plotly_chart(fig, use_container_width=True)

    st.subheader("Prix par arrondissement")
    fig2 = px.box(df, x="neighbourhood_group", y="price", points=False)
    fig2.update_yaxes(range=[0, 500])
    st.plotly_chart(fig2, use_container_width=True)

    st.subheader("Carte des annonces")
    sample = df.sample(min(3000, len(df)), random_state=1)
    fig3 = px.scatter_map(
        sample, lat="latitude", lon="longitude", color="price",
        size_max=8, zoom=10, map_style="open-street-map",
        color_continuous_scale="viridis", range_color=[0, 400],
        hover_data=["neighbourhood_group", "room_type"],
    )
    st.plotly_chart(fig3, use_container_width=True)

# ----------------------------------------------------------------------
with tab2:
    st.header("Entrainement et choix du modele")

    model_name = st.selectbox("Choix du modele", [
        "Regression lineaire", "Ridge", "Lasso", "KNN", "Random Forest",
        "Extra Trees", "Gradient Boosting", "XGBoost", "SVR",
    ])

    params = {}
    c1, c2, c3 = st.columns(3)
    if model_name in ("Ridge", "Lasso"):
        params["alpha"] = c1.slider("alpha", 0.01, 10.0, 1.0)
    if model_name == "KNN":
        params["n_neighbors"] = c1.slider("n_neighbors", 3, 50, 15)
    if model_name in ("Random Forest", "Extra Trees", "Gradient Boosting", "XGBoost"):
        params["n_estimators"] = c1.slider("n_estimators", 50, 500, 200, step=50)
        params["max_depth"] = c2.slider("max_depth", 2, 30, 10)
    if model_name in ("Gradient Boosting", "XGBoost"):
        params["learning_rate"] = c3.slider("learning_rate", 0.01, 0.3, 0.1)
    if model_name == "SVR":
        params["C"] = c1.slider("C", 1, 200, 50)

    test_size = st.slider("Taille du jeu de test", 0.1, 0.4, 0.2)

    if st.button("Entrainer le modele", type="primary"):
        X = df[NUM_FEATURES + CAT_FEATURES]
        y = df[TARGET]
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        with st.spinner("Entrainement en cours..."):
            pipe = build_pipeline(model_name, params)
            pipe.fit(X_train, y_train)
            y_pred = pipe.predict(X_test)

        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("RMSE", f"{rmse:.2f} $")
        m2.metric("MAE", f"{mae:.2f} $")
        m3.metric("R²", f"{r2:.3f}")
        m4.metric("MAPE", f"{mape:.1f} %")

        fig4 = px.scatter(
            x=y_test, y=y_pred, labels={"x": "Prix reel", "y": "Prix predit"},
            title="Prix reel vs Prix predit",
        )
        fig4.add_shape(type="line", x0=0, y0=0, x1=y_test.max(), y1=y_test.max(),
                        line=dict(color="red", dash="dash"))
        st.plotly_chart(fig4, use_container_width=True)

        st.session_state["trained_pipe"] = pipe
        st.session_state["trained_model_name"] = model_name
        st.success(f"Modele '{model_name}' entraine et pret pour l'onglet Test.")

    st.caption("Le meilleur modele (issu du benchmark complet, `src/train_models.py`) "
               "peut aussi etre charge directement ci-dessous.")
    if (MODELS_DIR / "best_model.joblib").exists():
        if st.button("Charger le meilleur modele du benchmark"):
            st.session_state["trained_pipe"] = joblib.load(MODELS_DIR / "best_model.joblib")
            st.session_state["trained_model_name"] = (MODELS_DIR / "best_model_name.txt").read_text().strip()
            st.success(f"Modele charge : {st.session_state['trained_model_name']}")

# ----------------------------------------------------------------------
with tab3:
    st.header("Tester une prediction")

    if "trained_pipe" not in st.session_state:
        st.warning("Entraine ou charge un modele dans l'onglet precedent avant de tester.")
    else:
        st.info(f"Modele actif : **{st.session_state['trained_model_name']}**")

        st.subheader("Zone de recherche du logement")
        st.caption("Clique sur la carte pour choisir la position du logement (latitude/longitude).")

        default_lat, default_lon = 40.73, -73.95
        if "sel_lat" not in st.session_state:
            st.session_state["sel_lat"] = default_lat
            st.session_state["sel_lon"] = default_lon

        m = folium.Map(
            location=[st.session_state["sel_lat"], st.session_state["sel_lon"]],
            zoom_start=11,
        )
        sample_map = df.sample(min(1500, len(df)), random_state=2)
        for _, row in sample_map.iterrows():
            folium.CircleMarker(
                location=[row["latitude"], row["longitude"]],
                radius=2, color="#2563eb", fill=True, fill_opacity=0.4,
            ).add_to(m)
        folium.Marker(
            location=[st.session_state["sel_lat"], st.session_state["sel_lon"]],
            icon=folium.Icon(color="red", icon="home"),
            tooltip="Position selectionnee",
        ).add_to(m)

        # key= fixe : sans cela, la carte etant reconstruite a chaque interaction
        # (changement de champ, clic sur un bouton), Streamlit la traite comme un
        # nouveau composant et efface la position cliquee avant qu'elle soit utilisee.
        map_data = st_folium(m, height=420, width=700, key="carte_test")

        if map_data and map_data.get("last_clicked"):
            st.session_state["sel_lat"] = map_data["last_clicked"]["lat"]
            st.session_state["sel_lon"] = map_data["last_clicked"]["lng"]

        sel_lat = st.session_state["sel_lat"]
        sel_lon = st.session_state["sel_lon"]
        st.caption(f"Position selectionnee : latitude {sel_lat:.4f}, longitude {sel_lon:.4f}")

        c1, c2, c3 = st.columns(3)
        neighbourhood_group = c1.selectbox("Arrondissement", sorted(df["neighbourhood_group"].unique()))
        room_type = c2.selectbox("Type de logement", sorted(df["room_type"].unique()))
        minimum_nights = c3.number_input("Nuits minimum", 1, 365, 3)

        c4, c5, c6 = st.columns(3)
        number_of_reviews = c4.number_input("Nombre d'avis", 0, 1000, 10)
        reviews_per_month = c5.number_input("Avis par mois", 0.0, 30.0, 1.0)
        availability_365 = c6.number_input("Disponibilite (jours/an)", 0, 365, 180)

        c7, c8 = st.columns(2)
        calculated_host_listings_count = c7.number_input("Annonces de cet hote", 1, 500, 1)
        days_since_last_review = c8.number_input("Jours depuis dernier avis", 0, 3000, 30)

        from src.preprocessing import haversine_distance, CENTER_LAT, CENTER_LON

        if st.button("Predire le prix", type="primary"):
            neighbourhood_freq = df.loc[
                df["neighbourhood_group"] == neighbourhood_group, "neighbourhood_freq"
            ].mean()
            input_row = pd.DataFrame([{
                "minimum_nights": minimum_nights,
                "number_of_reviews": number_of_reviews,
                "reviews_per_month": reviews_per_month,
                "calculated_host_listings_count": calculated_host_listings_count,
                "availability_365": availability_365,
                "availability_ratio": availability_365 / 365.0,
                "distance_center_km": haversine_distance(sel_lat, sel_lon, CENTER_LAT, CENTER_LON),
                "days_since_last_review": days_since_last_review,
                "reviews_per_listing": number_of_reviews / max(calculated_host_listings_count, 1),
                "is_multi_listing_host": int(calculated_host_listings_count > 1),
                "neighbourhood_freq": neighbourhood_freq,
                "latitude": sel_lat,
                "longitude": sel_lon,
                "neighbourhood_group": neighbourhood_group,
                "room_type": room_type,
            }])

            pred_price = st.session_state["trained_pipe"].predict(input_row)[0]
            avg_price = df.loc[df["neighbourhood_group"] == neighbourhood_group, "price"].mean()

            m1, m2, m3 = st.columns(3)
            m1.metric("Prix predit", f"{pred_price:.0f} $ / nuit")
            m2.metric(f"Prix moyen ({neighbourhood_group})", f"{avg_price:.0f} $")
            delta = pred_price - avg_price
            m3.metric("Ecart vs moyenne", f"{delta:+.0f} $")

            st.subheader("Logements disponibles autour de la position choisie")
            nearby = df.copy()
            nearby["dist_km"] = np.sqrt(
                (nearby["latitude"] - sel_lat) ** 2 + (nearby["longitude"] - sel_lon) ** 2
            ) * 111
            nearby = nearby.sort_values("dist_km").head(200)
            fig5 = px.scatter_map(
                nearby, lat="latitude", lon="longitude", color="price",
                zoom=13, map_style="open-street-map",
                center={"lat": sel_lat, "lon": sel_lon},
                color_continuous_scale="viridis",
                hover_data=["neighbourhood_group", "room_type", "price"],
            )
            fig5.add_scattermap(
                lat=[sel_lat], lon=[sel_lon], mode="markers",
                marker=dict(size=16, color="red"), name="Position choisie",
            )
            st.plotly_chart(fig5, use_container_width=True)
