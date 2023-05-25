import * as React from "react";
import { WC } from '@utils/WC'
import * as Spectrum from "react-uxp-spectrum"
import '../components/Settings.css'
import useToolbarStore  from "../stores/toolbar";
import { ToolbarButtons } from "../stores/toolbar";

const Settings:React.FunctionComponent = () => {
    const [buttons, setVisibility, uiTheme] = useToolbarStore((state) => [state.buttons, state.changeButttonVisibility, state.uiTheme])
    
    // handle checbox change and update the button visibility in the store
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, buttonId: string) => {
        setVisibility(buttonId, event.target.checked)
    }

    return (
        <form method="dialog">
            <Spectrum.Heading>Toolbar Settings</Spectrum.Heading>
            <Spectrum.Divider size="large"></Spectrum.Divider>
            
            <sp-action-group class="gridContainer">
                { buttons.map((componentData: ToolbarButtons) => {
                    const Component = componentData.component
                    
                    return <>
                        <WC className="buttonWrapper" onChange={ (event: React.ChangeEvent<HTMLInputElement>) => handleChange(event, componentData.id) }>
                            <div style={{
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <Spectrum.Checkbox checked={componentData.enabled}></Spectrum.Checkbox>
                                <Component key = {componentData.id} uiTheme = {uiTheme} {...componentData.props} style={{ cursor: "default" }}/>
                            </div>

                            <Spectrum.Body>{componentData.description}</Spectrum.Body>
                        </WC>
                    </>
                })}
            </sp-action-group>

            <footer>
                <Spectrum.Button
                    variant="primary"
                    onClick = { () => {
                        const dialogElement: HTMLDialogElement | null = document.getElementById("toolbarSettingsDialog") as HTMLDialogElement
                        if (dialogElement) { dialogElement.close('reasonCanceled') }
                    }}
                >
                    Close
                </Spectrum.Button>
            </footer>
        </form>
    )
}

export default Settings