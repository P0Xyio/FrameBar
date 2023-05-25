import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const CanvasSizeButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        const currentDocument = photoshop.app.activeDocument

        if (!currentDocument) {
            return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
        }
        
        try {
            photoshop.core.executeAsModal(async () => {
                return await photoshop.core.performMenuCommand({ "commandID": 1031 });
            }, {"commandName": "openCanvasSizeSettings"});
        } catch (e) { console.error(e) }
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = "Canvas"
                imgSrc="setCanvasSize"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default CanvasSizeButton