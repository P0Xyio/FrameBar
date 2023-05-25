import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { Layer } from "photoshop/dom/Layer";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const DuplicateLayerButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        
        await photoshop.core.executeAsModal(async () => {
            const currentDocument = photoshop.app.activeDocument

            if (!currentDocument) {
                return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
            }

            const selectedLayers: Layer[] = currentDocument.activeLayers

            selectedLayers.forEach((layer) => {
                layer.duplicate()
            })
        }, {"commandName": "duplicateFrame"});
    }

    return (
        <>
            <Button 
                onClicked ={ onClick }
                label = "Duplicate"
                imgSrc="duplicateFrame"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default DuplicateLayerButton