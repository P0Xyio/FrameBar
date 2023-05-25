import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const AddVideoGroupButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
    
        photoshop.core.executeAsModal(async () => {
            const currentDocument = photoshop.app.activeDocument

            if (!currentDocument) {
                return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
            }

            photoshop.action.batchPlay([
                {
                    _obj: "make",
                    _target: [
                        {
                            _ref: "sceneSection"
                        }
                    ],
                }
            ], {});
        }, {"commandName": "addNewVideoGroup"});
    }

    return (
        <>
            <Button 
                onClicked ={ onClick }
                label = "Add Video Group"
                imgSrc="addVideoGroup"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default AddVideoGroupButton