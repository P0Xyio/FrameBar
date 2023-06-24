import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const OnionSkinButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        const currentDocument = photoshop.app.activeDocument

        if (!currentDocument) {
            return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
        }

        try {
            photoshop.core.executeAsModal(async () => {
                const result = await photoshop.core.performMenuCommand({ "commandID": 4412 });

                if (!result.available) {
                    return photoshop.core.showAlert("The animation must have at least two frames to use Onion Skin.");
                }
            }, {"commandName": "Toggling Onion Skin"});
        } catch (e) { console.error(e) }
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = "Onion"
                imgSrc="enableOnion"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default OnionSkinButton