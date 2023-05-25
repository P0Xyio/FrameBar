import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { Layer } from "photoshop/dom/Layer";
import { constants } from "photoshop";

interface Props {
    direction: "Forward" | "Backward",
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

interface selectedLayers {
    "before": Layer | null
    "selected": Layer | null
    "after": Layer | null
}

interface iconsPath {
    Forward: string,
    Backward: string,
}

const iconsPath: iconsPath = {
    Forward: "moveFrameForwards",
    Backward: "moveFrameBackwards",
}

const MoveFrameButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        const currentDocument = photoshop.app.activeDocument

        // check if document has background layer. background layer affects layer indexxes
        const _hasBackgroundLayer = await photoshop.action.batchPlay([
            {
                _obj: "get",
                _target: [
                    {
                        _property: "hasBackgroundLayer"
                    },
                    {
                        _ref: "document",
                        _id: currentDocument.id
                    }
                ]
            }
        ], {})

        const hasBackgroundLayer: boolean = _hasBackgroundLayer[0]["hasBackgroundLayer"]

        if (!currentDocument) {
            return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
        }

        if (currentDocument.activeLayers.length === 0) {
            return photoshop.core.showAlert("Could not move the frame because no layers are selected.");
        } else if (currentDocument.activeLayers.length > 1) {
            return photoshop.core.showAlert("Could not move the frame because more than one layer is selected.");
        }

        if (currentDocument.activeLayers[0].allLocked) {
            return photoshop.core.showAlert("Could not move the frame because it is locked.");
        }
        
        await photoshop.core.executeAsModal(async () => {
            const layerId = currentDocument.activeLayers[0].id

            // get selected layer index
            const result = await photoshop.action.batchPlay([
                {
                    _obj: "get",
                    _target: [
                        {
                            _property: "itemIndex"
                        },
                        {
                            _ref: "layer",
                            _id: layerId
                        },
                        {
                            _ref: "document",
                            _id: currentDocument.id
                        }
                    ]
                }
            ], {})

            if (result[0] && result[0].itemIndex) {
                const currentLayerIndex: number = hasBackgroundLayer ? result[0].itemIndex - 1 : result[0].itemIndex
                const nextLayerIndex: number = props.direction === "Forward" ? currentLayerIndex + 1 : currentLayerIndex - 1

                // get next layer to check if we can move the selected frame
                const _nextLayer = await photoshop.action.batchPlay([
                    {
                        _obj: "get",
                        _target: [
                            {
                                _ref: "layer",
                                _index: nextLayerIndex
                            },
                            {
                                _ref: "document",
                                _id: currentDocument.id
                            }
                        ]
                    }
                ], {})
    
                if (_nextLayer.length === 0) {
                    return photoshop.core.showAlert("Could not move the frame because there are no more layers in that direction (1).")
                }

                const nextLayer = _nextLayer[0]

                if (nextLayer.parentLayerID !== currentDocument.activeLayers[0].parent?.id || nextLayer.layerKind === 13) {
                    return photoshop.core.showAlert("Could not move the frame because there are no more layers in that direction (2).")
                }
                
                if (nextLayer.layerLocking?.protectAll) {
                    return photoshop.core.showAlert("Could not move the frame because the layer in desired direction is locked.")
                }

                let destinationIndex: number = props.direction === "Forward" ? nextLayerIndex : nextLayerIndex - 1
                if (props.direction === "Forward" && hasBackgroundLayer === false) {
                    destinationIndex -= 1
                } else if (props.direction === "Backward" && hasBackgroundLayer === true) {
                    destinationIndex += 1
                }

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
                            _index: destinationIndex
                        },
                        layerID: [ layerId ]
                    }
                ], {})
            }
        }, {"commandName": "moveFrame"});
    }

    return (
        <>
            <Button 
                onClicked = { onClick }
                label = { props.direction }
                imgSrc= { iconsPath[props.direction as keyof iconsPath] }
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default MoveFrameButton