window.onload = () => {
    var tiles = [2, 3, 1, 4, 5, 6, 7, 8, 0];
    var startTiles = [...tiles];
    var endTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    var $target = $('.eight-puzzle');
    var dragging = false;
    var dragIndex = null;
    var settingStart = false;
    var settingEnd = false;
    var solutionStates = [];
    var dragControl = true;
    var renderTiles = function (tiles, $newTarget) {
        $target = $newTarget || $target;

        var $ul = $("<ul>", { "class": "n-puzzle" });

        $(tiles).each(function (index) {
            var correct = endTiles[index] === this;
            var cssClass = this === 0 ? "empty" : (correct ? "correct" : "incorrect");

            var $li = $("<li>", {
                "class": cssClass,
                "data-tile": this,
                "data-index": index,
                "style": `transform: translate(${(index % 3) * 82}px, ${Math.floor(index / 3) * 82}px)`
            }).text(this || "").appendTo($ul);

            $li.mousedown((event) => {
                dragging = true;
                dragIndex = index;
            });

            $li.mouseup((event) => {
                if (dragging) {
                    shiftTile(event);
                    dragging = false;
                    dragIndex = null;
                }
            });
        });

        $target.html($ul);
    };

    var shiftTile = function (event) {
        console.log(dragControl);
        var index = parseInt($(event.target).attr('data-index'));
        if(dragControl == true){
        if (dragIndex != null && dragIndex != index) {
            var temp = tiles[dragIndex];
            tiles[dragIndex] = tiles[index];
            tiles[index] = temp;
            renderTiles(tiles);
        }
    }
    };

    var shuffleTiles = function () {
        tiles = tiles.sort(() => Math.random() - 0.5);
        renderTiles(tiles);
    };

    var solvePuzzle = function () {
        $.ajax({
            url: '/solve',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ start: startTiles, end: endTiles }),
            success: function (response) {
                if (response.solution) {
                    solutionStates = response.solution;
                    displaySolution(response.solution);
                    dragControl = false;
                    $('.controls-hide').hide();
                    $('#reset').show();
                    $('#solution-carousel').show();
                } else {
                    alert('No solution found');
                }
            }
        });
    };
    var displaySolution = function (solution) {
        var $carouselInner = $('#carousel-inner');
        $carouselInner.empty();
    
        solution.forEach((state, index) => {
            var $carouselItem = $("<div>", {
                "class": "carousel-item" + (index === 0 ? " active" : "")
            });
    
            // Determine the state text based on index
            var stateText = index === 0 ? "Start State" : index === solution.length - 1 ? "Goal State" : `State ${index}`;
            
            // Create a span element with the state text
            var $stateSpan = $("<p>", {
                "class": "state-text",
                text: stateText
            });
    
            // Append the span to the carousel-item div
            $carouselItem.append($stateSpan);
    
            $carouselInner.append($carouselItem);
        });
    
        $('#solution-carousel').carousel(0); // Reset carousel to the first item
        $('#solution-carousel').on('slide.bs.carousel', function (e) {
            var stateIndex = $(e.relatedTarget).index();
            var stateText = stateIndex === 0 ? 'Start State' : stateIndex === solution.length - 1 ? 'Goal State' : `State ${stateIndex}`;
            $('#carousel-state').text(stateText);
            renderTiles(solution[stateIndex]);
        });
        $('#carousel-state').text('Start State'); // Initial state text
        renderTiles(solution[0]); // Render the start state initially
    };

    $('#shuffle').click(shuffleTiles);
    $('#set-start').click(() => {
        settingStart = true;
        settingEnd = false;
        startTiles = [...tiles];
        console.log(startTiles)
        alert('Start state set. Arrange tiles for end state.');
    });
    $('#set-end').click(() => {
        settingEnd = true;
        settingStart = false;
        endTiles = [...tiles];
        console.log(endTiles)
        alert('End state set.');
    });
    $('#solve').click(solvePuzzle);
    $('#reset').click(() => {
        location.reload();
    });

    renderTiles(tiles);
};
