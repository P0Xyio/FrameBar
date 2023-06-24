import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { Layer } from "photoshop/dom/Layer";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const DeleteLayerButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
    
        photoshop.core.executeAsModal(async () => {
            const currentDocument = photoshop.app.activeDocument

            if (!currentDocument) {
                return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
            }

            const selectedLayers: Layer[] = currentDocument.activeLayers

            if (selectedLayers.length === 0) {
                return photoshop.core.showAlert("Could not delete frames because no layers are selected.");
            }

            selectedLayers.forEach((layer) => {
                layer.delete()
            })
        }, {"commandName": "Deleting layer(s)"});
    }

    return (
        <>
            <Button 
                onClicked ={ onClick }
                label = "Delete"
                imgSrc="deleteFrame"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default DeleteLayerButton