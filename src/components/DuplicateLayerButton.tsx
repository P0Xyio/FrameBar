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
        
        photoshop.core.executeAsModal(async (executionContext) => {
            const currentDocument = photoshop.app.activeDocument

            if (!currentDocument) {
                return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
            }

            const selectedLayers: Layer[] = currentDocument.activeLayers

            if (selectedLayers.length === 0) {
                return photoshop.core.showAlert("Could not duplicate frames because no layers are selected.");
            }

            for (const [index, layer] of selectedLayers.entries()) {
                await layer.duplicate()
                executionContext.reportProgress({ "value": (index + 1) / selectedLayers.length })
            }
        }, {"commandName": "Duplicating frame(s)"})
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