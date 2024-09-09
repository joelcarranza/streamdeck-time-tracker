const togglBaseUrl = 'https://api.track.toggl.com/api/v9';

ToggleAPI = {};

ToggleAPI.getCurrentEntry = async function(apiToken) {
	if(!apiToken) {
		throw new Error("No API Token provided");
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
		return result;
	}
	else {
		throw new Error("Request failed!");
	}
}

ToggleAPI.getProject = async function (apiToken, workspaceId, projectId) {
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
			return result;
		}
		else {
			throw new Error("Request failed!");
		}
  }
  

ToggleAPI.startEntry = async function(apiToken, workspaceId) {
	var ts = new Date().toISOString();
	var response = await fetch(
	  `${togglBaseUrl}/workspaces/${workspaceId}/time_entries`, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
	  },
	  body: JSON.stringify({
		workspace_id: +workspaceId,
		duration: -1, 
		start:ts,
		created_with: 'Stream Deck'
	  })
	})
	if(response.ok) {
		return await response.json();
	}
	else {
		throw new Error("Request failed!");
	}
  }
  
ToggleAPI.stopEntry = async function(apiToken, workspaceId, entryId) {
	var response = await fetch(
	  `${togglBaseUrl}/workspaces/${workspaceId}/time_entries/${entryId}/stop`, {
	  method: 'PATCH',
	  headers: {
		Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
	  }
	})
	if(response.ok) {
		return await response.json();
	}
	else {
		throw new Error("Request failed!");
	}
}