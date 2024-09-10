
ToggleAPI = (function() {
	const URL_BASE = 'https://api.track.toggl.com/api/v9';

	function authHeaders(apiToken) {
		if(!apiToken) {
			throw new Error("No API Token provided");
		}
		return {
			Authorization: `Basic ${btoa(`${apiToken}:api_token`)}`
		};
	}

	async function getCurrentEntry(apiToken) {
		let url = `${URL_BASE}/me/time_entries/current`;
		let response = await fetch(url, {
		 	headers: authHeaders(apiToken)
		});
		if(response.ok) {
			return await response.json();
		}
		else {
			throw new Error(`Request to URL ${url} failed`);
		}
	}
	
	async function getProject(apiToken, workspaceId, projectId) {
			let url = `${URL_BASE}/workspaces/${workspaceId}/projects/${projectId}`;
			let response = await fetch(url, {
				headers: authHeaders(apiToken)
			});
			if(response.ok) {
				return await response.json();
			}
			else {
				throw new Error(`Request to URL ${url} failed`);
			}
	  }
	  
	
	async function startEntry(apiToken, workspaceId) {
		let url = `${URL_BASE}/workspaces/${workspaceId}/time_entries`;
		let ts = new Date().toISOString();
		let response = await fetch(url, {
			method: 'POST',
			headers: authHeaders(apiToken),
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
			throw new Error(`Request to URL ${url} failed`);
		}
	}
	  
	async function stopEntry(apiToken, workspaceId, entryId) {
		let url = `${URL_BASE}/workspaces/${workspaceId}/time_entries/${entryId}/stop`;
		let response = await fetch(url, {
			method: 'PATCH',
			headers: authHeaders(apiToken)
		})
		if(response.ok) {
			return await response.json();
		}
		else {
			throw new Error(`Request to URL ${url} failed`);
		}
	}
	
	async function getWorkspaces(apiToken) {
		let url = `${URL_BASE}/workspaces`;
		let response = await fetch(
			url, {
				headers: authHeaders(apiToken)
			})
		if(response.ok) {
			return await response.json();
		}
		else {
			throw new Error(`Request to URL ${url} failed`);
		}
	}
	
	return {getCurrentEntry, getProject, startEntry, stopEntry, getWorkspaces};

})();

