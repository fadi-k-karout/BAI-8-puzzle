from flask import Flask, request, jsonify, render_template
from algorithms.a_star import a_star_search, get_solution_path

app = Flask(__name__)

def is_valid_state(state):
    if isinstance(state, list) and len(state) == 9:
        return set(state) == set(range(9))
    return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    start_state = data.get('start')
    end_state = data.get('end')

    # Validate the start and end states
    if not (is_valid_state(start_state) and is_valid_state(end_state)):
        return jsonify({"error": "Invalid start or goal state provided."}), 400

    solution = a_star_search(start_state, end_state)
    if solution:
        path = get_solution_path(solution)
        return jsonify({"solution": path})
    else:
        return jsonify({"solution": None})

if __name__ == '__main__':
    app.run(debug=True)
