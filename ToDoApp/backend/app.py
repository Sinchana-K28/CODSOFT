from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow frontend to talk to backend

# temporary in-memory tasks storage
tasks = []

# Home route to confirm backend is running
@app.route("/")
def home():
    return "✅ Backend is running successfully!"

# Get all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)

# Add a new task
@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    task = {"id": len(tasks) + 1, "title": data["title"], "done": False}
    tasks.append(task)
    return jsonify(task), 201

# Update (toggle done) task by ID
@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = not task["done"]
            return jsonify(task)
    return jsonify({"error": "Task not found"}), 404

# Delete a task by ID
@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task["id"] != task_id]
    return jsonify({"message": "Task deleted"}), 200

# ✅ NEW: Clear all tasks
@app.route("/tasks", methods=["DELETE"])
def clear_tasks():
    global tasks
    tasks = []
    return jsonify({"message": "All tasks cleared"}), 200

if __name__ == "__main__":
    app.run(debug=True)
