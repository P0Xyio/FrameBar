import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const FlipLayerButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        const currentDocument = photoshop.app.activeDocument

        if (!currentDocument) {
            return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
        }

        async function flipLayer() {
            return await photoshop.action.batchPlay([
                {
                    "_obj": "flip",
                    "_target": [
                        {
                            "_ref": "document",
                            "_enum": "ordinal",
                            "_value": "first"
                        }
                    ],
                    "axis": {
                        "_enum": "orientation",
                        "_value": "horizontal"
                    },
                }
            ], {})
        }

        try {
            await photoshop.core.executeAsModal(flipLayer, {"commandName": "Flipping layer"});
        } catch (e) { console.error(e) }
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = "Flip Layer"
                imgSrc="flipLayer"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default FlipLayerButton