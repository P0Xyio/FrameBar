import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";

interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const TimelineButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        try {
            photoshop.core.executeAsModal(async () => {
                return await photoshop.core.performMenuCommand({ "commandID": 1188 });
            }, {"commandName": "openTimeLine"});
        } catch (e) { console.error(e) }
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = "TimeLine"
                imgSrc="showTimeline"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default TimelineButton