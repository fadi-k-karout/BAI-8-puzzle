from flask import Flask, request, jsonify, render_template
from algorithms.a_star import a_star_search, get_solution_path

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    start_state = data['start']
    end_state = data['end']
    solution = a_star_search(start_state, end_state)
    if solution:
        print(solution)
        path = get_solution_path(solution)
        return jsonify({"solution": path})
    else:
        return jsonify({"solution": None}), 400

if __name__ == '__main__':
    app.run(debug=True)
