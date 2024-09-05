/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const myAction = new Action('com.joelcarranza.time-tracker.action');
myAction.visibleContexts = {}

const UPDATE_INTERVAL = 15 * 1000;

$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
	setInterval(() => myAction.update(), UPDATE_INTERVAL);
});

myAction.onWillAppear(({ action, context, device, event, payload }) =>  {
	let settings = payload.settings;
	myAction.visibleContexts[context] = {settings};
	myAction.updateContext(context);
});


myAction.onDidReceiveSettings(({ action, context, device, event, payload }) =>  {
});

myAction.onKeyDown(({ action, context, device, event, payload }) => {
	console.log("onKeyDown " + this.apitoken);
});

function formatElapsed(start)
{
  var startDate = new Date(start);
  const seconds = (new Date().getTime() - startDate.getTime()) / 1000;
  if(seconds > 3600) {
    return Math.floor(seconds/3600) + ':' + leadingZero(Math.floor((seconds  % 3600)/60));
  }
  else if(seconds > 60) {
    return Math.floor(seconds/60) + 'min';
  }
  else {
    return '';
  }
}

myAction.updateContext = function(context) {
	if(context in this.visibleContexts)	{
		let apitoken = this.visibleContexts[context].settings['apitoken']
		if(apitoken) {
			togglGetCurrentEntry(apitoken).then(response => {
				if (response.ok) {
					response.json().then(responseData => {
						console.log("RESULT!");
						console.log(responseData);
						start = responseData.start;
						$SD.setTitle(context, formatElapsed(start));
				});
				}
				else {
					console.log("NOPE!");
					console.log(response);
				}
			});			
		}
	}
}

myAction.update = function() {
	console.log("update");
	console.log(this.visibleContexts);

	for (let context of Object.keys(this.visibleContexts)) {
		this.updateContext(context);
	}
}


const togglBaseUrl = 'https://api.track.toggl.com/api/v9';

function togglGetCurrentEntry(apiToken) {
	console.log("togglGetCurrentEntry" + apiToken)
	return fetch(
	  `${togglBaseUrl}/me/time_entries/current`, {
	  method: 'GET',
	  headers: {
		Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
	  }
	});
}
