
// Timer to ensure the host page is complete before we jam our shiz
var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    console.log("Beginning inject.js...");
    setTimeout(function(){ doSetup(); }, 1000);
  }
}, 10);

// Setup, build output UI, and attach DOM observers
var doSetup = function() {

  // inject pot odds UI box
  var html = "<div class='pot-odds-container'>Pot odds:&nbsp;<span class='pot-odds-value'>&mdash;</span></div>";
  jQuery(".table").prepend(jQuery(html));

  // inject stack total UI box
  var html = "<div class='chip-count-container'>Chip count:&nbsp;<span class='chip-count-value'>&mdash;</span></div>";
  jQuery(".table").prepend(jQuery(html));

  // Initiate observers
  var targetNode = jQuery(".table")[0];

  // Options for the observer (which mutations to observe)
  const config = {characterData: true, attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {

      // Skip non-element nodes
      if (
        !mutation.target.getAttribute
        || !mutation.target.getAttribute('class')
      ) { continue }

      var c = mutation.target.getAttribute('class');

      if ( c.match(/decision\-current|flipped/) ) 
      { 
        updatePotOdds();
      }
    }
  };

  // Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  console.log("...setup done.")
};

// Do the main thing
var updatePotOdds = function() {

  jQuery(".pot-odds-value").html("&mdash;");

  // Extract current pot size
  var potTotal = parseInt(jQuery(".table-pot-size").text());

  // Extract current bets into array
  var currentBets = 
    jQuery(".table-player p.table-player-bet-value")
    .toArray()
    .map(function(e) {return parseFloat(e.innerText.replace(/check/i, "0"));} );

  // Sum up all current bets on the table, including current player
  var currentBetsTotal = currentBets.reduce((a,b) => a+b, 0);

  // Find out largest current bet
  var largestCurrentBet = Math.max(...currentBets);

  // Locate current player and extract bet size
  var currentPlayer = jQuery(".decision-current").parent();
  var currentPlayerBetUI = currentPlayer.find("p.table-player-bet-value");
  var currentPlayerBet = 0 + (
    currentPlayerBetUI 
    && parseFloat(currentPlayerBetUI.text().replace(/check/i, "0") || 0)
  );

  console.log("Pot: " + potTotal);
  console.log("Current bet total: " + currentBetsTotal);
  console.log("Largest current bet: " + largestCurrentBet);
  console.log("Current player bet: " + currentPlayerBet);

  // Update pot odds display if the current bet is smaller than the biggest bet on the table
  if (largestCurrentBet > 0 && largestCurrentBet > currentPlayerBet) {
    var amountToWin = potTotal + currentBetsTotal;
    var callToMake = largestCurrentBet - currentPlayerBet;
    var potOdds = (callToMake / amountToWin).toFixed(2);
    
    console.log("Pot odds: " + potOdds);
    jQuery(".pot-odds-value").html(potOdds);
  }

  // Display count of all chips on the table.
  // TODO: refactor this into a separate function, which daws current values from global variables.
  var stackTotals = jQuery(".table-player-stack").toArray().reduce((a,b)=> a+parseInt(b.innerText),0);
  var chipCount = stackTotals + potTotal + currentBetsTotal;
  jQuery(".chip-count-value").html(chipCount);
};
