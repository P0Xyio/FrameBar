import * as React from "react";
import photoshop from "@utils/Photoshop";
import { PanelController } from "./controllers/PanelController";
import { createDialog } from "@utils/Dialog";
import { entrypoints } from "uxp";
import Toolbar from "./panels/Toolbar";
import Settings from "./panels/Settings";
import useToolbarStore  from "./stores/toolbar";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
// Declare spectrum widgets so that TS Compiler doesn't throw errors
declare global {
	namespace JSX {
		interface IntrinsicElements {
			"sp-action-group": any;
            "sp-asset": any;
		}
	}
}

// Entrtpoint for the toolbar
const toolbarPanel = new PanelController(<Toolbar/>, [
    {
        id: "reloadPlugin",
        label: "Reload Plugin",
        enabled: true,
        checked: false,
        oninvoke: () => location.reload(),
    },
    {
        id: "openSettings",
        label: "Open Toolbar Settings",
        enabled: true,
        checked: false,
        oninvoke: () => {
            createDialog("toolbarSettingsDialog", "Toolbar Settings", <Settings/>)
        },
    }
])

entrypoints.setup({
    plugin: {
        create() {},
        destroy() {}
    },
    panels: {
        "toolbar": toolbarPanel,
    }
});
/**
 * Helper function for updating the uiTheme in the store.
 * @param theme - kuiBrightnessLevel from the Photoshop
 */
const updateUITheme = (theme: string) => {
    switch (theme) {
        case "kPanelBrightnessDarkGray":
        case "kPanelBrightnessMediumGray": {
            useToolbarStore.setState({ uiTheme: "D" })
            break;
        }
        case "kPanelBrightnessLightGray":
        case "kPanelBrightnessOriginal": {
            useToolbarStore.setState({ uiTheme: "L" })
            break;
        }
        default: break
    }
}

// Listens for the interface theme change.
photoshop.action.addNotificationListener(["uiBrightnessChanged"], (eventName: string, eventData: any) => {
    if (eventName !== "uiBrightnessChanged") { return }
    if (!eventData?.kuiBrightnessLevel) { return }
    updateUITheme(eventData.kuiBrightnessLevel._value)
})

// Get the theme and update it in the store at the startup.
photoshop.action.batchPlay([{
    "_obj": "get", 
    "_target": [{"_property": "kuiBrightnessLevel"},{"_ref": "application","_enum": "ordinal","_value": "targetEnum"}],
}],{ "synchronousExecution": false})
    .then((result: ActionDescriptor[]) => { 
        const uiTheme = result?.[0]?.kuiBrightnessLevel?._value;
        if (!uiTheme) { return }
        updateUITheme(uiTheme)
    })
    .catch(console.error)
  