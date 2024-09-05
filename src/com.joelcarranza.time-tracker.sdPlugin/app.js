/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const myAction = new Action('com.joelcarranza.time-tracker.action');


$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
});

myAction.onWillAppear(({ action, context, device, event, payload }) =>  {
	let settings = payload.settings;
	this.apitoken = settings['apitoken']

	if(this.apitoken) {
		togglGetCurrentEntry(this.apitoken).then(response => {
			if (response.ok) {
				response.json().then(responseData => {
					console.log("RESULT!");
					console.log(responseData);
			});
			}
			else {
				console.log("NOPE!");
				console.log(response);
			}
		});
	}
});


myAction.onDidReceiveSettings(({ action, context, device, event, payload }) =>  {
	let settings = payload.settings;
	this.apitoken = settings['apitoken']

	if(this.apitoken) {
		togglGetCurrentEntry(this.apitoken).then(response => {
			if (response.ok) {
				response.json().then(responseData => {
					console.log(responseData);
			});
			}
			else {
				console.log("NOPE!");
				console.log(response);
			}
		});
	}
});

myAction.onKeyDown(({ action, context, device, event, payload }) => {
	console.log("onKeyDown " + this.apitoken);
});


const togglBaseUrl = 'https://api.track.toggl.com/api/v9';

function togglGetCurrentEntry(apiToken) {
	return fetch(
	  `${togglBaseUrl}/me/time_entries/current`, {
	  method: 'GET',
	  headers: {
		Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
	  }
	});
}
