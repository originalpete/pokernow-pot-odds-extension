// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


// Set up listener port to process inbound messages from the content script.
chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
  	console.log("Received message: ");
  	console.log(msg);
  });
});

console.log("background.js loaded");