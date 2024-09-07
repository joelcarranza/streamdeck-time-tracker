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

myAction.onWillDisappear(({ action, context, device, event, payload }) =>  {
	delete myAction.visibleContexts[context];
});

myAction.onDidReceiveSettings(({ action, context, device, event, payload }) =>  {
	let settings = payload.settings;
	if(context in myAction.visibleContexts) {
		myAction.visibleContexts[context].settings = settings;
	}
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

function leadingZero(val)
{
  let s = val.toFixed();
  return s.length == 1 ? '0' + s : s;
}

function setDrawnImage(context, drawFunc) {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	drawFunc(ctx, canvas.width, canvas.height)
	result = $SD.setImage(
		context,
		canvas.toDataURL()
	);
}

myAction.updateContext = function(context) {
	if(context in this.visibleContexts)	{
		let apitoken = this.visibleContexts[context].settings['apitoken']
		if(apitoken) {
			togglGetCurrentEntry(apitoken).then(responseData => {
				console.log("RESULT!");
				console.log(responseData);
				if(responseData) {
					start = responseData.start;
					$SD.setTitle(context, formatElapsed(start));
					setDrawnImage(context, (ctx, width, height) => {
						ctx.fillStyle = '#ffaa00';
						ctx.fillRect(0, 0, width, height);
					})
				}
				else {
					$SD.setTitle(context, "");
					result = $SD.setImage(
						context,
						null // use default image
						// must be image url
						//"data:image/svg+xml;charset=utf8,<svg height=\"100\" width=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"black\" stroke-width=\"3\" fill=\"red\" /></svg>",
					);
				}
			}).catch((e) => {
				console.log(e);
			});
		}
	}
}

myAction.update = function() {
	for (let context of Object.keys(this.visibleContexts)) {
		this.updateContext(context);
	}
}


const togglBaseUrl = 'https://api.track.toggl.com/api/v9';

async function togglGetCurrentEntry(apiToken) {
	// TODO: eventually do catching here
	console.log("togglGetCurrentEntry" + apiToken)
	if(!apiToken) {
		throw new Exception("No API Token provided");
	}
	let response = await fetch(
	  `${togglBaseUrl}/me/time_entries/current`, {
	  method: 'GET',
	  headers: {
		Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
	  }
	});
	if(response.ok) {
		result = await response.json();
		if(result) {
			project_id = result.project_id;
			workspace_id  = result.workspace_id;
			if(project_id) {
				//result.project = await togglGetProject(apiToken, workspace_id, project_id);
			}
		}
		return result;
	}
	else {
		throw new Exception("Request failed!");
	}
}


function togglGetProject(apiToken, workspaceId, projectId) {
	return fetch(
	  `${togglBaseUrl}/workspaces/${workspaceId}/projects/${projectId}`, {
		method: 'GET',
		headers: {
		  Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
		}
	  });
  }
  