/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const timeTrackerAction = new Action('com.joelcarranza.time-tracker.action');
timeTrackerAction.visibleContexts = {}

const UPDATE_INTERVAL = 15 * 1000;

$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
	setInterval(() => timeTrackerAction.update(), UPDATE_INTERVAL);
});

timeTrackerAction.onWillAppear(({ action, context, device, event, payload }) =>  {
	let settings = payload.settings;
	timeTrackerAction.visibleContexts[context] = {settings};
	timeTrackerAction.updateContext(context);
});

timeTrackerAction.onWillDisappear(({ action, context, device, event, payload }) =>  {
	delete timeTrackerAction.visibleContexts[context];
});

timeTrackerAction.onDidReceiveSettings(({ action, context, device, event, payload }) =>  {
	let settings = payload.settings;
	if(context in timeTrackerAction.visibleContexts) {
		timeTrackerAction.visibleContexts[context].settings = settings;
	}
});

timeTrackerAction.onKeyDown(({ action, context, device, event, payload }) => {
	console.log("onKeyDown ");
	let settings = payload.settings;
	let apitoken = settings['apitoken'];
	let workspace = settings['workspace'];

	togglGetCurrentEntry(apitoken).then(responseData => {
		if(responseData) {
			togglStopEntry(apitoken, responseData.workspace_id, responseData.id).then(result => {
				timeTrackerAction.updateContext(context);
			})
		}
		else {
			togglStartEntry(apitoken, workspace).then(result => {
				timeTrackerAction.updateContext(context);
			});
		}
	});
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
    return '0';
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



timeTrackerAction.updateContext = function(context) {
	if(context in this.visibleContexts)	{
		let apitoken = this.visibleContexts[context].settings['apitoken']
		if(apitoken) {
			togglGetCurrentEntry(apitoken).then(responseData => {
				console.log("RESULT!", apitoken, responseData);
				if(responseData) {
					start = responseData.start;
					project = responseData.project;
					console.log(responseData);
					setDrawnImage(context, (ctx, w, h) => {
						// draw bottom label
						x = 4
						y = 4

						let fontFamily = 'Tahoma,Verdana,Segoe,sans-serif';
						
						ctx.clearRect(0, 0, w, h);
						
						// draw project name at bottom
						
						let text = project ? project.name : 'No Project';
						ctx.fillStyle = "rgb(255 255 255)"
						ctx.font = '9pt ' + fontFamily;

						let measure = ctx.measureText(text);
						ctx.fillText(text, 
							(w-measure.width)/2,
							h-4);
					
						h -= 12

						// draw circle with project color

						if(project) {
							ctx.fillStyle  = project.color;
							ctx.beginPath();
							ctx.arc(w/2, h/2, 24, 0, Math.PI * 2, true); // Outer
							ctx.fill()
						}
						else {
							ctx.strokeStyle  = "#2d2d2d";
							ctx.lineWidth = 4;
							ctx.beginPath();
							ctx.arc(w/2, h/2, 24, 0, Math.PI * 2, true); // Outer
							ctx.stroke()							
						}
						
						// draw time elaped in center 
						text = formatElapsed(start)
						ctx.fillStyle = "rgb(255 255 255)"
						ctx.font = 'bold 24pt '  + fontFamily;
						measure = ctx.measureText(text);
					
						ctx.fillText(text, 
									(w-measure.width)/2,
									h - (w-measure.fontBoundingBoxAscent )/2);
					});
				}
				else {
					result = $SD.setImage(
						context,
						null
					);
				}
			}).catch((e) => {
				console.log(e);
			});
		}
	}
}

timeTrackerAction.update = function() {
	for (let context of Object.keys(this.visibleContexts)) {
		this.updateContext(context);
	}
}


const startTimerAction = new Action('com.joelcarranza.start-timer.action');

startTimerAction.onKeyDown(({ action, context, device, event, payload }) => {
	console.log("onKeyDown ");
	let settings = payload.settings;
	let apitoken = settings['apitoken'];
	let workspace = settings['workspace'];
	let project = settings['project'];
	let description = settings['description'];

	togglStartEntry(apitoken, workspace, project, description).then(result => {
		timeTrackerAction.update()
	});
});


CURRENT_ENTRY_CACHE = {};

async function togglGetCurrentEntry(apiToken) {
	if(!apiToken) {
		throw new Error("No API Token provided");
	}
	if(apiToken in CURRENT_ENTRY_CACHE) {
		let e = CURRENT_ENTRY_CACHE[apiToken];
		if(e.expires > Date.now()) {
			console.log("return entry from cache");
			return e.result;
		}
	}

	let result = await ToggleAPI.getCurrentEntry(apiToken);
	if(result) {
		let project_id = result.project_id;
		let workspace_id  = result.workspace_id;
		if(project_id) {
			result.project = await togglGetProject(apiToken, workspace_id, project_id);
		}
		else {
			result.project = null;
		}
	}
	CURRENT_ENTRY_CACHE[apiToken] = {result, expires: Date.now() + 15000};
	return result;
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
		let result = await ToggleAPI.getProject(apiToken, workspaceId, projectId);
		PROJECT_CACHE[cacheKey] = {result, expires: Date.now() + 60*60*1000};
		return result;
  }
  

async function togglStartEntry(apiToken, workspaceId, project=null, description=null) {
	if(!workspaceId) {
		var workspaces = await ToggleAPI.getWorkspaces(apiToken);
		workspaceId = workspaces[0].id;
	}
	if(!project) {
		project = null;
	}
	let result = await ToggleAPI.startEntry(apiToken, workspaceId, project, description);
	delete CURRENT_ENTRY_CACHE[apiToken];
	return result;
}
  
async function togglStopEntry(apiToken, workspaceId, entryId) {
	let result = await ToggleAPI.stopEntry(apiToken, workspaceId, entryId);
	delete CURRENT_ENTRY_CACHE[apiToken];
	return result;
}