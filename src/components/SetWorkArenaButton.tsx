import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
interface Props {
    side: string,
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

interface iconsPath {
    start: string,
    end: string,
    clear: string,
}

const iconsPath: iconsPath = {
    start: "setStartWorkArena",
    end: "setEndWorkArena",
    clear: "clearWorkArena",
}

const SetWorkArenaButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        const currentDocument = photoshop.app.activeDocument

        if (!currentDocument) {
            return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
        }

        photoshop.core.executeAsModal(async () => {
            const isTimelineEnabled = await photoshop.action.batchPlay([
                {
                    "_obj": "get",
                    "_target": [
                        {
                            "_property": "enabled"
                        },
                        {
                            "_ref": "timeline",
                            "_enum": "ordinal",
                            "_value": "targetEnum"
                        }
                    ]
                }
            ], {})

            if (!isTimelineEnabled?.[0]?.enabled) {
                return photoshop.core.showAlert("Please create a video timeline first, to use this button.");
            }

            const currentFrameData = await photoshop.action.batchPlay([
                {
                    "_obj": "get",
                    "_target": [
                        {
                            "_ref": "property",
                            "_property": "time"
                        },
                        {
                            "_ref": "timeline"
                        }
                    ],
                }
            ], {});

            const actions: ActionDescriptor[] = []
            let propertyString = null

            switch (props.side) {
                case "start": {
                    propertyString = "workInTime"
                    break;
                }

                case "end": {
                    propertyString = "workOutTime"
                    break;
                }

                default: break
            }

            if (propertyString !== null) {
                // restrict the playback on one side
                actions.push({
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "property",
                            "_property": propertyString
                        },
                        {
                            "_ref": "timeline"
                        }
                    ],
                    "to": {...currentFrameData[0].time},
                 })
            } else {
                // clear the restrictions

                // get animation length
                const timelineData = await photoshop.action.batchPlay([
                    {
                        "_obj": "get",
                        "_target": [
                            {
                                "_ref": "property",
                                "_property": "documentTimelineSettings"
                            },
                            {
                                "_ref": "timeline"
                            }
                        ],
                    }
                ], {});

                actions.push({
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "property",
                            "_property": "workInTime"
                        },
                        {
                            "_ref": "timeline"
                        }
                    ],
                    "to": {
                        "_obj": "timecode",
                        "seconds": 0,
                        "frame": 0,
                        "frameRate": timelineData[0].frameRate
                     },
                },
                {
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "property",
                            "_property": "workOutTime"
                        },
                        {
                            "_ref": "timeline"
                        }
                    ],
                    "to": {
                        "_obj": "timecode",
                        "seconds": timelineData[0].duration.seconds,
                        "frame": timelineData[0].duration.frame,
                        "frameRate": timelineData[0].frameRate
                     },
                })
            }
        
            photoshop.action.batchPlay(actions, {});
        }, {"commandName": "Setting Work Arena"});
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = { props.side }
                imgSrc= { iconsPath[props.side as keyof iconsPath] }
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default SetWorkArenaButton