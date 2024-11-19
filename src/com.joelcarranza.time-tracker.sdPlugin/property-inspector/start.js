/// <reference path="../libs/js/property-inspector.js" />
/// <reference path="../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings} = payload;

    console.dir(settings);
    Utils.setFormValue(settings, form);
    updateWorkspaces();
    updateProjects();

    form.addEventListener(
        'input',
        Utils.debounce(150, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );
});

function apiTokenChanged() {
    updateWorkspaces();
}

function workspaceChanged() {
    document.getElementById('workspaceid').value = document.getElementById('workspace').value;
    updateProjects();
}

function projectsChanged() {
    document.getElementById('projectid').value = document.getElementById('project').value;
}

function updateProjects() {
    let apiToken = document.getElementById('apitoken').value;
    let workspaceId = document.getElementById('workspaceid').value;
    let currentProjectId = document.getElementById('projectid').value;

    if(apiToken && workspaceId) {
        ToggleAPI.getProjects(apiToken, workspaceId).then(projectData => {
            document.getElementById('project').innerHTML = ''
            const selectEl = document.getElementById('project')

            addOption(selectEl, '', '', currentProjectId == '');
            projectData.forEach((project, n) => {
                addOption(selectEl, project.id, project.name, currentProjectId == project.id); 
            });
            const form = document.querySelector('#property-inspector');
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    }
}

function addOption(selectEl, value, name, selected=false) {   
    const optionEl = document.createElement('option');
    optionEl.innerText = name;
    optionEl.value = value;
    optionEl.selected = selected;
    selectEl.append(optionEl);
}

function updateWorkspaces() {
    let apiToken = document.getElementById('apitoken').value;
    let currentWorkspaceId = document.getElementById('workspaceid').value;

    if(apiToken) {
        ToggleAPI.getWorkspaces(apiToken).then(workspaceData => {
            document.getElementById('workspace').innerHTML = ''
            const selectEl = document.getElementById('workspace')

            workspaceData.forEach((ws, n) => {
                addOption(selectEl, ws.id, ws.name, ws.id == currentWorkspaceId);
            });

            const form = document.querySelector('#property-inspector');
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);

            document.getElementById('no-workspace-message').style.display = 'none';

            workspaceChanged()
        }).catch((error) => {
            document.getElementById('no-workspace-message').style.display = 'block';
            document.getElementById('workspace').innerHTML = '';
        });
    }
    else {
        document.getElementById('no-workspace-message').style.display = 'block';
        document.getElementById('workspace').innerHTML = '';
    }
}
