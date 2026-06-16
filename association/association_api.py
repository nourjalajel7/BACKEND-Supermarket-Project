from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import joblib
import numpy as np
import pandas as pd
import association


app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_FILE = os.path.join(BASE_DIR, "inventory_sales_forecast_model.pkl")
PREDICTIONS_FILE = os.path.join(BASE_DIR, "weekly_sales_predictions.csv")
REORDER_FILE = os.path.join(BASE_DIR, "reorder_alerts.csv")
METRICS_FILE = os.path.join(BASE_DIR, "model_metrics.json")
PRODUCT_RULES_FILE = os.path.join(BASE_DIR, "product_association_rules.csv")
CATEGORY_RULES_FILE = os.path.join(BASE_DIR, "category_association_rules.csv")


def dataframe_to_json(df):
    df = df.replace({np.nan: None})
    return df.to_dict(orient="records")


def load_predictions():
    if not os.path.exists(PREDICTIONS_FILE):
        return pd.DataFrame()
    return pd.read_csv(PREDICTIONS_FILE)


def load_reorder_alerts():
    if not os.path.exists(REORDER_FILE):
        return pd.DataFrame()
    return pd.read_csv(REORDER_FILE)


def load_model_bundle():
    if not os.path.exists(MODEL_FILE):
        return None
    return joblib.load(MODEL_FILE)


def load_rules(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{os.path.basename(file_path)} not found")

    rules_df = pd.read_csv(file_path)
    required_cols = ["antecedents", "consequents", "support", "confidence", "lift"]
    missing = [col for col in required_cols if col not in rules_df.columns]

    if missing:
        raise ValueError(f"Missing required rule columns: {', '.join(missing)}")

    rules_df["antecedents"] = rules_df["antecedents"].apply(json.loads)
    rules_df["consequents"] = rules_df["consequents"].apply(json.loads)

    return rules_df


def get_rule_recommendations(rules_df, selected_items, top_n=10):
    selected_items = [
        str(item).strip()
        for item in selected_items
        if str(item).strip() != ""
    ]
    selected_set = set(selected_items)
    recommendations = {}

    for _, row in rules_df.iterrows():
        antecedents = set(row["antecedents"])
        consequents = set(row["consequents"])

        if antecedents.issubset(selected_set):
            for item in consequents:
                if item not in selected_set:
                    score = float(row["confidence"]) * float(row["lift"])
                    recommendation_data = {
                        "item": item,
                        "support": float(row["support"]),
                        "confidence": float(row["confidence"]),
                        "lift": float(row["lift"]),
                        "score": score
                    }

                    if item not in recommendations or score > recommendations[item]["score"]:
                        recommendations[item] = recommendation_data

    sorted_recommendations = sorted(
        recommendations.values(),
        key=lambda recommendation: recommendation["score"],
        reverse=True
    )

    return sorted_recommendations[:top_n]


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Smart Supermarket Forecast and Association API is running",
        "available_endpoints": {
            "recommendations": "/recommend",
            "product_recommendations": "/recommend-products",
            "category_recommendations": "/recommend-categories",
            "metrics": "/api/metrics",
            "predictions": "/api/predictions",
            "reorder_alerts": "/api/reorder-alerts",
            "monthly_sales": "/api/monthly-sales",
            "top_products": "/api/top-products",
            "model_info": "/api/model-info",
            "product_prediction": "/api/product-prediction?product=Milk",
            "single_prediction": "/api/predict"
        }
    })


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json(silent=True)

    if not data or "items" not in data:
        return jsonify({
            "error": "Please send items"
        }), 400

    items = data["items"]

    try:
        result = association.get_recommendations(items)
    except (FileNotFoundError, ValueError) as error:
        return jsonify({
            "error": str(error)
        }), 400
    except Exception:
        app.logger.exception("Recommendation failed")
        return jsonify({
            "error": "Recommendation service failed"
        }), 500

    return jsonify({
        "input_items": items,
        "recommendations": result
    })


@app.route("/recommend-products", methods=["POST"])
def recommend_products():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    items = data.get("items", [])
    top_n = data.get("top_n", 10)

    if not isinstance(items, list):
        return jsonify({
            "error": "items must be a list"
        }), 400

    try:
        top_n = int(top_n)
        product_rules = load_rules(PRODUCT_RULES_FILE)
        results = get_rule_recommendations(
            rules_df=product_rules,
            selected_items=items,
            top_n=top_n
        )
    except (FileNotFoundError, ValueError, json.JSONDecodeError) as error:
        return jsonify({
            "error": str(error)
        }), 400
    except Exception:
        app.logger.exception("Product recommendation failed")
        return jsonify({
            "error": "Product recommendation service failed"
        }), 500

    return jsonify({
        "type": "product_recommendations",
        "input_items": items,
        "recommendations": results
    })


@app.route("/recommend-categories", methods=["POST"])
def recommend_categories():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    categories = data.get("categories", [])
    top_n = data.get("top_n", 10)

    if not isinstance(categories, list):
        return jsonify({
            "error": "categories must be a list"
        }), 400

    try:
        top_n = int(top_n)
        category_rules = load_rules(CATEGORY_RULES_FILE)
        results = get_rule_recommendations(
            rules_df=category_rules,
            selected_items=categories,
            top_n=top_n
        )
    except (FileNotFoundError, ValueError, json.JSONDecodeError) as error:
        return jsonify({
            "error": str(error)
        }), 400
    except Exception:
        app.logger.exception("Category recommendation failed")
        return jsonify({
            "error": "Category recommendation service failed"
        }), 500

    return jsonify({
        "type": "category_recommendations",
        "input_categories": categories,
        "recommendations": results
    })


@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    if not os.path.exists(METRICS_FILE):
        return jsonify({"error": "model_metrics.json not found"}), 404

    with open(METRICS_FILE, "r", encoding="utf-8") as file:
        metrics = json.load(file)

    return jsonify(metrics)


@app.route("/api/predictions", methods=["GET"])
def get_predictions():
    df = load_predictions()

    if df.empty:
        return jsonify({"error": "weekly_sales_predictions.csv not found or empty"}), 404

    limit = request.args.get("limit", default=100, type=int)

    return jsonify(dataframe_to_json(df.head(limit)))


@app.route("/api/reorder-alerts", methods=["GET"])
def get_reorder_alerts():
    df = load_reorder_alerts()

    if df.empty:
        return jsonify([])

    return jsonify(dataframe_to_json(df))


@app.route("/api/monthly-sales", methods=["GET"])
def get_monthly_sales():
    df = load_predictions()

    if df.empty:
        return jsonify({"error": "weekly_sales_predictions.csv not found or empty"}), 404

    required_cols = ["Month", "Next_Week_Sales", "Predicted_Next_Week_Sales"]
    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        return jsonify({
            "error": "Missing required columns in predictions file",
            "missing_columns": missing
        }), 400

    monthly = (
        df.groupby("Month")[["Next_Week_Sales", "Predicted_Next_Week_Sales"]]
        .sum()
        .reset_index()
    )

    month_order = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    monthly["Month"] = pd.Categorical(
        monthly["Month"],
        categories=month_order,
        ordered=True
    )

    monthly = monthly.sort_values("Month")

    return jsonify(dataframe_to_json(monthly))


@app.route("/api/product-prediction", methods=["GET"])
def get_product_prediction():
    product = request.args.get("product", default="", type=str)

    if not product:
        return jsonify({
            "error": "Please provide product name",
            "example": "/api/product-prediction?product=Milk"
        }), 400

    df = load_predictions()

    if df.empty:
        return jsonify({"error": "weekly_sales_predictions.csv not found or empty"}), 404

    if "Product" not in df.columns:
        return jsonify({
            "error": "Missing required columns in predictions file",
            "missing_columns": ["Product"]
        }), 400

    product_df = df[df["Product"].astype(str).str.contains(product, case=False, na=False)]

    if product_df.empty:
        return jsonify({
            "message": "No product found",
            "searched_product": product
        }), 404

    if "Time_Index" in product_df.columns:
        product_df = product_df.sort_values("Time_Index")

    return jsonify(dataframe_to_json(product_df))


@app.route("/api/top-products", methods=["GET"])
def get_top_products():
    df = load_predictions()

    if df.empty:
        return jsonify({"error": "weekly_sales_predictions.csv not found or empty"}), 404

    limit = request.args.get("limit", default=10, type=int)

    required_cols = ["Product", "Category", "Predicted_Next_Week_Sales", "Absolute_Error"]
    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        return jsonify({
            "error": "Missing required columns in predictions file",
            "missing_columns": missing
        }), 400

    top_products = (
        df.groupby(["Product", "Category"])
        .agg(
            total_predicted_sales=("Predicted_Next_Week_Sales", "sum"),
            average_predicted_sales=("Predicted_Next_Week_Sales", "mean"),
            average_error=("Absolute_Error", "mean")
        )
        .reset_index()
        .sort_values("total_predicted_sales", ascending=False)
        .head(limit)
    )

    return jsonify(dataframe_to_json(top_products))


@app.route("/api/model-info", methods=["GET"])
def get_model_info():
    bundle = load_model_bundle()

    if bundle is None:
        return jsonify({"error": "Model file not found"}), 404

    features = bundle.get("features", [])

    return jsonify({
        "message": "Model loaded successfully",
        "target": bundle.get("target"),
        "features_count": len(features),
        "features": features,
        "description": bundle.get("description")
    })


def build_prediction_response(data):
    bundle = load_model_bundle()

    if bundle is None:
        return jsonify({"error": "Model file not found"}), 404

    model = bundle["model"]
    features = bundle["features"]
    ratio_map = bundle.get("calibration_ratio_by_product_id", {})

    missing = [feature for feature in features if feature not in data]

    if missing:
        return jsonify({
            "error": "Missing required features",
            "missing_features": missing
        }), 400

    input_df = pd.DataFrame([data])[features]
    raw_prediction = model.predict(input_df)[0]

    product_id = data.get("ID")
    calibration_ratio = ratio_map.get(product_id, ratio_map.get(str(product_id), 1.0))

    calibrated_prediction = raw_prediction * calibration_ratio
    current_sales = float(data.get("Sales", 0))
    sales_lag_48 = float(data.get("Sales_Lag_48", data.get("Sales_Lag_4", 0)))

    final_prediction = (
        0.70 * calibrated_prediction +
        0.20 * current_sales +
        0.10 * sales_lag_48
    )
    final_prediction = max(final_prediction, 0)

    return jsonify({
        "raw_model_prediction": round(float(raw_prediction), 2),
        "calibration_ratio": round(float(calibration_ratio), 3),
        "predicted_next_week_sales": round(float(final_prediction), 2)
    })


@app.route("/api/predict", methods=["POST"])
def predict_single_row():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "No JSON body sent"}), 400

    return build_prediction_response(data)


@app.route("/predict-stock", methods=["POST"])
def predict_stock_alias():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "No JSON body sent"}), 400

    return build_prediction_response(data)


if __name__ == "__main__":
    port = int(os.environ.get("ASSOCIATION_API_PORT", 5001))
    app.run(debug=True, port=port)
