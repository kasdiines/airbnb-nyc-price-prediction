"""
Comparaison de modeles de prediction du prix, optimisation des hyperparametres,
evaluation avec plusieurs metriques et validation croisee.
"""
import json
import time
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    ExtraTreesRegressor,
    GradientBoostingRegressor,
    RandomForestRegressor,
)
from sklearn.linear_model import ElasticNet, Lasso, LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, RandomizedSearchCV, cross_validate, train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "airbnb_clean.csv"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
MODELS_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

NUM_FEATURES = [
    "minimum_nights", "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365", "availability_ratio",
    "distance_center_km", "days_since_last_review", "reviews_per_listing",
    "is_multi_listing_host", "neighbourhood_freq", "latitude", "longitude",
]
CAT_FEATURES = ["neighbourhood_group", "room_type"]
TARGET = "price"

RANDOM_STATE = 42


def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUM_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES),
        ]
    )


def get_models():
    return {
        "LinearRegression": LinearRegression(),
        "Ridge": Ridge(random_state=RANDOM_STATE),
        "Lasso": Lasso(random_state=RANDOM_STATE, max_iter=5000),
        "ElasticNet": ElasticNet(random_state=RANDOM_STATE, max_iter=5000),
        "KNN": KNeighborsRegressor(n_neighbors=15),
        "DecisionTree": DecisionTreeRegressor(random_state=RANDOM_STATE, max_depth=10),
        "RandomForest": RandomForestRegressor(
            n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1, max_depth=15
        ),
        "ExtraTrees": ExtraTreesRegressor(
            n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1, max_depth=15
        ),
        "GradientBoosting": GradientBoostingRegressor(random_state=RANDOM_STATE),
        "SVR": SVR(kernel="rbf", C=50, epsilon=0.1),
        "XGBoost": XGBRegressor(
            n_estimators=300, max_depth=6, learning_rate=0.08,
            random_state=RANDOM_STATE, n_jobs=-1, verbosity=0,
        ),
        "MLP (reseau de neurones)": MLPRegressor(
            hidden_layer_sizes=(64, 32), max_iter=500, random_state=RANDOM_STATE,
            early_stopping=True,
        ),
    }


def evaluate(y_true, y_pred):
    return {
        "RMSE": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "MAE": float(mean_absolute_error(y_true, y_pred)),
        "R2": float(r2_score(y_true, y_pred)),
        "MAPE": float(mean_absolute_percentage_error(y_true, y_pred)),
    }


def main():
    df = pd.read_csv(DATA_PATH)
    X = df[NUM_FEATURES + CAT_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    preprocessor = build_preprocessor()
    models = get_models()
    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    results = []
    fitted_pipelines = {}

    for name, model in models.items():
        t0 = time.time()
        pipe = Pipeline([("prep", preprocessor), ("model", model)])

        cv_res = cross_validate(
            pipe, X_train, y_train, cv=cv,
            scoring=["neg_root_mean_squared_error", "neg_mean_absolute_error", "r2"],
            n_jobs=-1,
        )

        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        test_metrics = evaluate(y_test, y_pred)
        elapsed = time.time() - t0

        row = {
            "model": name,
            "cv_RMSE_mean": -cv_res["test_neg_root_mean_squared_error"].mean(),
            "cv_RMSE_std": cv_res["test_neg_root_mean_squared_error"].std(),
            "cv_MAE_mean": -cv_res["test_neg_mean_absolute_error"].mean(),
            "cv_R2_mean": cv_res["test_r2"].mean(),
            "test_RMSE": test_metrics["RMSE"],
            "test_MAE": test_metrics["MAE"],
            "test_R2": test_metrics["R2"],
            "test_MAPE": test_metrics["MAPE"],
            "train_time_s": elapsed,
        }
        results.append(row)
        fitted_pipelines[name] = pipe
        print(f"[{name}] RMSE={test_metrics['RMSE']:.2f}  MAE={test_metrics['MAE']:.2f}  "
              f"R2={test_metrics['R2']:.3f}  ({elapsed:.1f}s)")

    results_df = pd.DataFrame(results).sort_values("test_RMSE")
    results_df.to_csv(REPORTS_DIR / "model_comparison.csv", index=False)
    print("\n=== Classement (par RMSE test) ===")
    print(results_df[["model", "test_RMSE", "test_MAE", "test_R2", "test_MAPE"]].to_string(index=False))

    # --- Optimisation des hyperparametres sur les 3 meilleurs modeles ---
    top3 = results_df["model"].head(3).tolist()
    print(f"\nOptimisation des hyperparametres pour : {top3}")

    param_grids = {
        "RandomForest": {
            "model__n_estimators": [100, 200, 300, 400],
            "model__max_depth": [8, 12, 15, 20, None],
            "model__min_samples_leaf": [1, 2, 4],
        },
        "ExtraTrees": {
            "model__n_estimators": [100, 200, 300, 400],
            "model__max_depth": [8, 12, 15, 20, None],
            "model__min_samples_leaf": [1, 2, 4],
        },
        "GradientBoosting": {
            "model__n_estimators": [100, 200, 300],
            "model__max_depth": [2, 3, 4, 5],
            "model__learning_rate": [0.03, 0.05, 0.1, 0.2],
        },
        "XGBoost": {
            "model__n_estimators": [200, 300, 400, 600],
            "model__max_depth": [4, 6, 8, 10],
            "model__learning_rate": [0.03, 0.05, 0.08, 0.1],
            "model__subsample": [0.7, 0.85, 1.0],
        },
    }

    best_overall = None
    best_overall_rmse = np.inf
    tuning_results = []

    for name in top3:
        if name not in param_grids:
            pipe = fitted_pipelines[name]
            y_pred = pipe.predict(X_test)
            rmse = evaluate(y_test, y_pred)["RMSE"]
            if rmse < best_overall_rmse:
                best_overall_rmse, best_overall = rmse, (name, pipe)
            continue

        base_pipe = Pipeline([("prep", preprocessor), ("model", get_models()[name])])
        search = RandomizedSearchCV(
            base_pipe, param_grids[name], n_iter=12, cv=3,
            scoring="neg_root_mean_squared_error", random_state=RANDOM_STATE,
            n_jobs=-1,
        )
        search.fit(X_train, y_train)
        best_pipe = search.best_estimator_
        y_pred = best_pipe.predict(X_test)
        metrics = evaluate(y_test, y_pred)
        tuning_results.append({
            "model": name, "best_params": search.best_params_, **metrics,
        })
        print(f"[{name} optimise] {metrics}  params={search.best_params_}")

        if metrics["RMSE"] < best_overall_rmse:
            best_overall_rmse = metrics["RMSE"]
            best_overall = (name, best_pipe)

    with open(REPORTS_DIR / "tuning_results.json", "w", encoding="utf-8") as f:
        json.dump(tuning_results, f, indent=2, default=str, ensure_ascii=False)

    best_name, best_pipe = best_overall
    print(f"\n>>> Meilleur modele final : {best_name} (RMSE={best_overall_rmse:.2f})")
    joblib.dump(best_pipe, MODELS_DIR / "best_model.joblib")
    with open(MODELS_DIR / "best_model_name.txt", "w") as f:
        f.write(best_name)

    # Feature importance si dispo
    try:
        model = best_pipe.named_steps["model"]
        feature_names = best_pipe.named_steps["prep"].get_feature_names_out()
        importances = model.feature_importances_
        fi = pd.DataFrame({"feature": feature_names, "importance": importances})
        fi = fi.sort_values("importance", ascending=False)
        fi.to_csv(REPORTS_DIR / "feature_importance.csv", index=False)
    except AttributeError:
        pass


if __name__ == "__main__":
    main()
