from heapq import heappush, heappop

class PuzzleState:
    def __init__(self, state, parent, action, depth, cost, key, end_state):
        self.state = state
        self.parent = parent
        self.action = action
        self.depth = depth
        self.cost = cost
        self.key = key
        self.end_state = end_state

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
    key = ''.join(str(e) for e in start_state)
    start_node = PuzzleState(start_state, None, None, 0, manhattan_distance(start_state, end_state), key, end_state)
    frontier = []
    heappush(frontier, start_node)
    explored = set()

    while frontier:
        current_node = heappop(frontier)
        if current_node.state == end_state:
            return current_node
        explored.add(current_node.key)

        for action, new_state in get_possible_moves(current_node.state):
            new_key = ''.join(str(e) for e in new_state)
            if new_key not in explored:
                new_node = PuzzleState(new_state, current_node, action, current_node.depth + 1,
                                       current_node.depth + 1 + manhattan_distance(new_state, end_state), new_key, end_state)
                heappush(frontier, new_node)
    return None

def get_solution_path(solution):
    path = []
    while solution:
        path.append(solution.state)
        solution = solution.parent
    return path[::-1]
