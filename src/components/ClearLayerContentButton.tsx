import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const ClearLayerContentButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        photoshop.core.executeAsModal(async () => {
            const currentDocument = photoshop.app.activeDocument

            if (!currentDocument) {
                return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
            }
    
            // set selection and delete content
            const result: ActionDescriptor[] = await photoshop.action.batchPlay([
                {
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "channel",
                            "_property": "selection"
                        }
                    ],
                    "to": {
                        "_enum": "ordinal",
                        "_value": "allEnum"
                    },
                },
                {
                    "_obj": "delete",
                }
            ], {});
            
            // always clear selection
            await photoshop.action.batchPlay([
                {
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "channel",
                            "_property": "selection"
                        }
                    ],
                    "to": {
                        "_enum": "ordinal",
                        "_value": "none"
                    },
                }
            ], {});

            // if the second action didn't return result
            if (result.length < 2 || Object.values(result[1]).length > 0) {
                photoshop.core.showAlert("Could not clear the layer because the Timeline play head is not over the target layer in the Timeline or no layer is selected.");
            }
        }, {"commandName": "clearLayerContent"});
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = "Clear Layer Content"
                imgSrc="clearLayerContent"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default ClearLayerContentButton