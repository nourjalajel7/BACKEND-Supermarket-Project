from flask import Flask, jsonify, request
from flask_cors import CORS

import association


app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Supermarket Association API is running"
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


if __name__ == "__main__":
    app.run(debug=True, port=5001)
