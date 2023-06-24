import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { getLayerById } from "@utils/Layers";
import { Layer } from "photoshop/dom/Layer";
import { constants } from "photoshop";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
interface Props {
    label: string,
    count: number,
    bindClick: boolean
}

interface iconsPath {
    1: string,
    2: string,
}

const iconsPath: iconsPath = {
    1: "addOneFrame",
    2: "addTwoFrames",
}


interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

const NewFrameButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        photoshop.core.executeAsModal(async () => {
            const currentDocument = photoshop.app.activeDocument

            if (!currentDocument) {
                return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
            }

            const _timelineData: ActionDescriptor[] = await photoshop.action.batchPlay([
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

            if (!_timelineData) { return }
            if (!_timelineData?.[0]) { return }
            const timelineData = _timelineData[0];

            if (!timelineData?.duration) {
                return photoshop.core.showAlert("Could not create a frame(s) because there is no timeline.");
            }

            let animGroup: Layer
            let selectedLayer: Layer
        
            const selectedLayers = currentDocument.activeLayers
            
            // if the frame is selected, we want to create a new within the same group and after the selected frame
            if (selectedLayers.length === 1) {
                selectedLayer = selectedLayers[0]
        
                if (selectedLayer.parent && selectedLayer.parent.kind === constants.LayerKind.GROUP) {
                    animGroup = selectedLayer.parent
                }
            }
        
            if (!animGroup) { // if we didn't get video group from the selected frame
                const animGroups: Layer[] = currentDocument.layers.filter((h:any) => h.kind === constants.LayerKind.GROUP);
                const selectedAnimGroups: Layer[] = animGroups.filter((h:any) => h.selected === true);
                animGroup = selectedAnimGroups.length === 0 ? animGroups[0] : selectedAnimGroups[0]
            }
        
            if (!animGroup) { 
                return photoshop.core.showAlert("To add a frame, please create a video group.")
            }
        
            // make sure the video group/layer is selected, expand the group, add a new layer and adjust the length
            const actions: ActionDescriptor[] = [  
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_ref": "layer",
                            "_name": animGroup.name
                        }
                    ],
                    "makeVisible": false,
                    "layerID": [
                        animGroup.id
                    ],
                },
                {
                    "_obj": "set",
                    "_target": {
                        "_ref": [
                            {"_property": "layerSectionExpanded"},
                            {
                                "_ref": "layer", 
                                "_id": animGroup.id
                            }
                        ],
                    },
                    "to": true
                },
                {
                    "_obj":"make",
                    "_target":[
                        {"_ref":"layer"}
                    ]
                },
                {
                    "_obj":"moveOutTime",
                    "timeOffset":{
                        "_obj":"timecode",
                        "frame":(timelineData.frameRate * -1) + props.count,
                        "frameRate":timelineData.frameRate,
                        "seconds":-4
                    }
                },
            ]
            
            if (selectedLayer) {
                // get itemIndex of the selected layer
                actions.push({
                    _obj: "get",
                    _target: [
                        {
                            _property: "itemIndex"
                        },
                        {
                            _ref: "layer",
                            _id: selectedLayer.id
                        },
                        {
                            _ref: "document",
                            _id: currentDocument.id
                        }
                    ]
                })
            }
        
            const result = await photoshop.action.batchPlay(actions, {});
            if (!selectedLayer) { return }
            if (!result?.[2]?.layerID) { return }
            if (!result?.[4]?.itemIndex) { return }

            // place the new frame, after the selected one
            await photoshop.action.batchPlay([
                {
                    _obj: "move",
                    _target: [
                        {
                            _ref: "layer",
                            _enum: "ordinal",
                            _value: "targetEnum"
                        }
                    ],
                    to: {
                        _ref: "layer",
                        _index: result[4].itemIndex
                    },
                    layerID: [ result[2].layerID ]
                }
            ], {})
        }, {"commandName": "Creating new frame(s)"});
    }

    return (
        <>
            <Button 
                onClicked ={ onClick }
                label = { props.label }
                imgSrc= { iconsPath[props.count as keyof iconsPath] }
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default NewFrameButton