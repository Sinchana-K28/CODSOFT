from flask import Flask, request, jsonify
from flask_cors import CORS
import secrets
import string

app = Flask(__name__)
CORS(app)  # Allow frontend to connect

@app.route("/")
def home():
    return "✅ Password Generator Backend Running!"

@app.route("/generate", methods=["POST"])
def generate_password():
    data = request.get_json() or {}

    try:
        length = int(data.get("length", 8))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid length value"}), 400

    use_letters = bool(data.get("letters", True))
    use_digits = bool(data.get("digits", True))
    use_special = bool(data.get("special", True))

    if length < 4:
        return jsonify({"error": "Password length must be at least 4"}), 400
    if length > 100:
        return jsonify({"error": "Password length must not exceed 100"}), 400

    pools = []
    if use_letters:
        pools.append(string.ascii_letters)
    if use_digits:
        pools.append(string.digits)
    if use_special:
        pools.append("!@#$%^&*()-_=+[]{}|;:,.<>?/")  # safer subset

    if not pools:
        return jsonify({"error": "Select at least one character type"}), 400

    # Ensure at least one char from each pool
    password_chars = [secrets.choice(pool) for pool in pools]

    # Fill remaining
    all_chars = "".join(pools)
    for _ in range(length - len(password_chars)):
        password_chars.append(secrets.choice(all_chars))

    # Shuffle securely
    rng = secrets.SystemRandom()
    rng.shuffle(password_chars)

    return jsonify({"password": "".join(password_chars)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
