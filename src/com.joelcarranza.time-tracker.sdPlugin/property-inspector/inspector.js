/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings} = payload;

    console.dir(settings);
    Utils.setFormValue(settings, form);
    if(settings.apitoken) {
        updateWorkspaces(settings.apitoken, settings.workspace);
    }

    form.addEventListener(
        'input',
        Utils.debounce(150, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );
});

function apiTokenChanged() {
    updateWorkspaces(document.getElementById('apitoken').value);
}

function updateWorkspaces (apiToken, workspaceId) {
    if(apiToken) {
        ToggleAPI.getWorkspaces(apiToken).then(workspaceData => {
            document.getElementById('workspace').innerHTML = ''
            const selectEl = document.getElementById('workspace')
            workspaceData.forEach((ws, n) => {
                const optionEl = document.createElement('option');
                optionEl.innerText = ws.name;
                optionEl.value = ws.id.toString();
                if(workspaceId) {
                    optionEl.selected = ws.id == workspaceId;
                }
                else {
                    optionEl.selected = (n == 0);
                }
                selectEl.append(optionEl)
            });
        });
    }
    else {
        document.getElementById('workspace').innerHTML = ''
    }
}
