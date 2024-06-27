from heapq import heappush, heappop

class PuzzleState:
    def __init__(self, state, parent, action, depth, cost, key):
        self.state = state
        self.parent = parent
        self.action = action
        self.depth = depth
        self.cost = cost
        self.key = key

    def __lt__(self, other):
        return self.cost < other.cost

def manhattan_distance(state, end_state):
    distance = 0
    for i in range(len(state)):
        if state[i] != 0:
            x, y = divmod(state[i] - 1, 3)
            end_x, end_y = divmod(end_state.index(state[i]), 3)
            distance += abs(x - end_x) + abs(y - end_y)
    return distance

def linear_conflict(state, end_state):
    conflict = 0
    size = int(len(state) ** 0.5)
    for i in range(size):
        for j in range(size):
            if state[i * size + j] == 0:
                continue
            for k in range(j + 1, size):
                if state[i * size + k] == 0:
                    continue
                if (state[i * size + j] - 1) // size == i and (state[i * size + k] - 1) // size == i and state[i * size + j] > state[i * size + k]:
                    conflict += 2
            for k in range(i + 1, size):
                if state[k * size + j] == 0:
                    continue
                if (state[k * size + j] - 1) % size == j and (state[i * size + j] - 1) % size == j and state[i * size + j] > state[k * size + j]:
                    conflict += 2
    return conflict

def heuristic(state, end_state):
    return manhattan_distance(state, end_state) + linear_conflict(state, end_state)

def get_possible_moves(state):
    moves = []
    zero_index = state.index(0)
    zero_row, zero_col = divmod(zero_index, 3)
    directions = {'Up': -3, 'Down': 3, 'Left': -1, 'Right': 1}

    for action, offset in directions.items():
        new_index = zero_index + offset
        if 0 <= new_index < 9:
            new_row, new_col = divmod(new_index, 3)
            if abs(zero_row - new_row) + abs(zero_col - new_col) == 1:
                new_state = state[:]
                new_state[zero_index], new_state[new_index] = new_state[new_index], new_state[zero_index]
                moves.append((action, new_state))
    return moves

def a_star_search(start_state, end_state):
    start_key = ''.join(str(e) for e in start_state)
    start_node = PuzzleState(start_state, None, None, 0, heuristic(start_state, end_state), start_key)
    frontier = []
    heappush(frontier, start_node)
    explored = {}

    while frontier:
        current_node = heappop(frontier)
        if current_node.state == end_state:
            return current_node
        explored[current_node.key] = current_node.cost

        for action, new_state in get_possible_moves(current_node.state):
            new_key = ''.join(str(e) for e in new_state)
            new_cost = current_node.depth + 1 + heuristic(new_state, end_state)
            if new_key not in explored or new_cost < explored[new_key]:
                new_node = PuzzleState(new_state, current_node, action, current_node.depth + 1, new_cost, new_key)
                heappush(frontier, new_node)
                explored[new_key] = new_cost
    return None

def get_solution_path(solution):
    path = []
    while solution:
        path.append(solution.state)
        solution = solution.parent
    return path[::-1]
