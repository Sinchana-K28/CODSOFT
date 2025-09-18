from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import re

app = Flask(__name__)
CORS(app)  # allow frontend to connect


# Safe evaluation of math expressions
def safe_eval(expr):
    try:
        # Allow only numbers, operators, and decimal points
        if not re.match(r'^[0-9+\-*/%.^() ]+$', expr):
            return "error", "Invalid characters in expression"

        # Replace ^ with ** for power
        expr = expr.replace("^", "**")

        # Evaluate safely
        result = eval(expr, {"__builtins__": None}, {})
        return result
    except ZeroDivisionError:
        return "error", "Division by zero not allowed"
    except Exception as e:
        return "error", str(e)


@app.route("/")
def home():
    return jsonify({"message": "✅ Calculator Backend is Running!"})


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json

    if not data or "expression" not in data:
        return jsonify({"status": "error", "message": "No expression provided"}), 400

    expression = data["expression"]

    result = safe_eval(expression)

    if isinstance(result, tuple) and result[0] == "error":
        return jsonify({"status": "error", "message": result[1]}), 400

    return jsonify({"status": "success", "result": result})


if __name__ == "__main__":
    app.run(debug=True)
