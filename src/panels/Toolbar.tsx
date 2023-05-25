import * as React from "react";
import { ToolbarButtons } from "../stores/toolbar";
import useToolbarStore  from "../stores/toolbar";
import { shallow } from 'zustand/shallow'
import "../components/Toolbar.css"

const Toolbar:React.FunctionComponent = () => {
    const [buttons, uiTheme] = useToolbarStore((state) => [state.buttons, state.uiTheme], shallow)
    const groups = ["general", "frames", "layerManipulation", "colourOverlay", "workspace"]

    return (
        <div id="toolbarWrapper">
            { groups.map((group) => (
                <sp-action-group key={group}>
                    { buttons
                        .filter((componentData: ToolbarButtons) => 
                            componentData.enabled !== false && 
                            componentData.group === group
                        )
                        .map((componentData: ToolbarButtons) => {
                            const Component = componentData.component;
                            return <Component 
                                key={componentData.id} 
                                bindClick={true} 
                                uiTheme={uiTheme} 
                                description={componentData.description} 
                                {...componentData.props} 
                            />;
                        })
                    }
                </sp-action-group>
            ))}
        </div>
    );
}

export default Toolbar