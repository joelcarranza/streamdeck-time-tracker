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
    return Math.floor(seconds/60);
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
					project = responseData.project;
					console.log(responseData);
//					$SD.setTitle(context, formatElapsed(start));
					setDrawnImage(context, (ctx, w, h) => {
						// draw bottom label
						x = 2
						y = 2

						
						ctx.clearRect(0, 0, w, h);
						
						let projectText = project ? project.name : '';
						ctx.fillStyle = "rgb(255 255 255)"
						ctx.font = "24pt monospace";
						ctx.fillText(projectText, x, h);
					
						h -= 12
					
						ctx.fillStyle  = project ? project.color : "rgb(200 0 0)";
						ctx.beginPath();
						ctx.arc(w/2, h/2, h/2 - 1, 0, Math.PI * 2, true); // Outer
						ctx.fill()
					
						text = formatElapsed(start)
						ctx.fillStyle = "rgb(255 255 255)"
						ctx.font = "64pt monospace";
						measure = ctx.measureText(text);
					
						ctx.fillText(text, 
									x + (w-measure.width)/2,
									h - (w-measure.fontBoundingBoxAscent )/2);
					});
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


CURRENT_ENTRY_CACHE = {};

async function togglGetCurrentEntry(apiToken) {
	if(!apiToken) {
		throw new Exception("No API Token provided");
	}
	if(apiToken in CURRENT_ENTRY_CACHE) {
		let e = CURRENT_ENTRY_CACHE[apiToken];
		if(e.expires > Date.now()) {
			console.log("return entry from cache");
			return e.result;
		}
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
				result.project = await togglGetProject(apiToken, workspace_id, project_id);
			}			
		}
		CURRENT_ENTRY_CACHE[apiToken] = {result, expires: Date.now() + 15000};
		return result;
	}
	else {
		throw new Error("Request failed!");
	}
}


PROJECT_CACHE = {};

async function togglGetProject(apiToken, workspaceId, projectId) {
		let cacheKey = [apiToken, workspaceId, projectId].join(',');
		if(cacheKey in PROJECT_CACHE) {
			let e = PROJECT_CACHE[cacheKey];
			if(e.expires > Date.now()) {
				console.log("return project from cache");
				return e.result;
			}
		}

		let response = await fetch(`${togglBaseUrl}/workspaces/${workspaceId}/projects/${projectId}`, {
			method: 'GET',
			headers: {
			Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
			}
		});
		if(response.ok) {
			let result = await response.json();
			PROJECT_CACHE[cacheKey] = {result, expires: Date.now() + 60*60*1000};
			return result;
		}
		else {
			throw new Error("Request failed!");
		}
  }
  