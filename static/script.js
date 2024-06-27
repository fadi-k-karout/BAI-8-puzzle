window.onload = () => {
    var tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    startTiles = [6,1,3,4,5,7,0,2,8];
    endTiles = [4,8,7,2,0,1,5,6,3];
    var $target = $('.eight-puzzle');
    var dragging = false;
    var dragIndex = null;
    var settingStart = false;
    var settingEnd = false;
    var solutionStates = [];
    var dragControl = true;


// Display info toast for the user
toastr.info(
    "Set the start and goal state by dragging and dropping tiles or use the input fildes by entering the numbers between 0 and 8 separeted by commas.",
    "Welcome!",
    {
      positionClass: "toast-top-right",
      timeOut: 0, // Set timeOut to 0 to make the toast not timeout
      extendedTimeOut: 0, // Also set extendedTimeOut to 0 for consistency
      closeButton: true, // Optionally show close button
      progressBar: true // Optionally show progress bar
    }
  );

      // Function to update the input fields with the current state
      var updateInputFields = function() {
        $('#start-state-input').val(startTiles.join(','));
        $('#goal-state-input').val(endTiles.join(','));
    };
  //populate input dileds with defualt states
  updateInputFields();

    var renderTiles = function (tiles, $newTarget) {
      $target = $newTarget || $target;

      var $ul = $("<ul>", { "class": "n-puzzle" });

      $(tiles).each(function (index) {
        var correct = endTiles[index] === tiles[index];
        var cssClass = tiles[index] === 0 ? "empty" : (correct ? "correct" : "incorrect");

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
      if (dragControl == true) {
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

    var solvePuzzle = function (start, goal) {

      if (start.length == 0 || goal.length == 0) {
        //Set Default values for puzzle start & end states

    
      } 
        $('.controls-hide').hide();
        $('#reset').hide();
        $('#loader').show();
        $.ajax({
          url: '/solve',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ start: startTiles, end: endTiles }),
          success: function (response) {
            $('#loader').hide(); // Hide the loader
            if (response.solution) {
              solutionStates = response.solution;
              displaySolution(response.solution);
              dragControl = false;
              $('#reset').show();
              $('#solution-carousel').show();
            } else {
              endTiles = [];
              $('.controls-hide').show();
              $('#reset').show();
              toastr.error('No solution found, Please try a different Puzzle', "Error", { positionClass: "toast-top-center" });
            }
          },
          error: function () {
            $('#loader').hide(); // Hide the loader on error
            endTiles = [];
            $('.controls-hide').show();
            $('#reset').show();
            toastr.error('An error occurred while solving the puzzle. Please try again.', "Error", { positionClass: "toast-top-center" });
          }
        });
     
    };

    var displaySolution = function (solution) {
      var $carouselInner = $('#carousel-inner');
      $carouselInner.empty();
      renderTiles(solution[0]);
      solution.forEach((state, index) => {
        var $carouselItem = $("<div>", {
          "class": "carousel-item" + (index === 0 ? " active" : "")
        });

        var stateText = index === 0 ? "Start State" : index === solution.length - 1 ? "Goal State" : `State ${index}`;

        var $stateSpan = $("<p>", {
          "class": "state-text",
          text: stateText
        });

        $carouselItem.append($stateSpan);
        $carouselInner.append($carouselItem);
      });

      $('#solution-carousel').carousel(0);
      
      // Pause the carousel after the last slide
      $('#solution-carousel').on('slid.bs.carousel', function (e) {
        var $carouselItems = $('.carousel-item');
        var lastItemIndex = $carouselItems.length - 1;
        var currentIndex = $carouselItems.index($('.carousel-item.active'));

        if (currentIndex === lastItemIndex) {
          $('#solution-carousel').carousel('pause');
        }

        var stateIndex = $(e.relatedTarget).index();
        var stateText = stateIndex === 0 ? 'Start State' : stateIndex === lastItemIndex ? 'Goal State' : `State ${stateIndex}`;
        $('#carousel-state').text(stateText);
        renderTiles(solution[stateIndex]);
      });

      $('#carousel-state').text('Start State');
      renderTiles(solution[0]);

      // Automatically start the carousel
      setTimeout(() => {
        $('#solution-carousel').carousel('cycle');
      }, 1000);
    };



    $('#shuffle').click(shuffleTiles);
    $('#set-start').click(() => {
        settingStart = true;
        settingEnd = false;
        startTiles = [...tiles];
        updateInputFields(); // Update the input fields
        toastr.success('Start state set. Arrange tiles for end state.', "Success", { positionClass: "toast-top-center" });
    });

    $('#set-end').click(() => {
        settingEnd = true;
        settingStart = false;
        endTiles = [...tiles];
        updateInputFields(); // Update the input fields
        toastr.success('End state set.', "Success", { positionClass: "toast-top-center" });
    });

    function isValidState(input) {
        // Trim whitespaces and then check if the input contains only numbers between 0 and 8, separated by commas
        var regex = /^(?:[0-8],){8}[0-8]$/;
        return regex.test(input.trim());
      }
    $('#solve').click(() => {
        var startState = $('#start-state-input').val().trim();
        var goalState = $('#goal-state-input').val().trim();
      
        // Validate the states here
        if (isValidState(startState) && isValidState(goalState)) {
          // If valid, convert to arrays and proceed with solving the puzzle
          var startStateArray = startState.split(',').map(Number);
          var goalStateArray = goalState.split(',').map(Number);
          solvePuzzle(startStateArray, goalStateArray);
        } else {
          // Replace the alert with a toast notification
          toastr.error('Please enter valid numbers between 0 and 8 for both states.', 'Invalid Input', {
            positionClass: 'toast-top-center',
            closeButton: true,
            progressBar: true,
            timeOut: 5000, // Display for 5 seconds
          });
        }
      });
      
    $('#reset').click(() => {
      location.reload();
    });

    renderTiles(tiles);
  };