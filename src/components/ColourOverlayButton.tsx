import * as React from "react";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
import { Layer } from "photoshop/dom/Layer";

interface Props {
    label: string,
    colour: string,
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

interface coloursCount {
    "255": number;
    "0": number
}

interface colourData {
    red: number,
    grain: number,
    blue: number
}

interface coloursContainer {
    red: colourData,
    grain: colourData,
    blue: colourData
}

const colorData: coloursContainer = {
    red: {
        red: 255,
        grain: 0,
        blue: 0
    },
    grain: {
        red: 0,
        grain: 255,
        blue: 0
    },
    blue: {
        red: 0,
        grain: 0,
        blue: 255
    },
}

interface iconsPath {
    red: string,
    grain: string,
    blue: string,
    none: string
}

const iconsPath: iconsPath = {
    red: "colourOverlayRed",
    grain: "colourOverlayGreen",
    blue: "colourOverlayBlue",
    none: "colourOverlayNone",
}

const ColourOverlayButton:React.FunctionComponent<Props> = (props: Props) => {
    // check if the colour overlay is present 
    // as we are applying only the edge colours, there should be one 255 and two zeros in the RGB
    const checkIfHasColourOverlay = (colourOverlay: any):Boolean => {
        if (colourOverlay._obj !== "RGBColor") { return false }
        const coloursCount: coloursCount = {
            "255": 0, 
            "0": 0
        }

        Object.values(colourOverlay).forEach((element:any) => {
            if (typeof(element) === "string") { return }
            const colour:string = String(Math.floor(element))

            coloursCount[colour as keyof coloursCount] ++
        })

        return coloursCount["255"] == 1 && coloursCount["0"] == 2
    }

    const onClick = async () => {
        const currentDocument = photoshop.app.activeDocument

        if (!currentDocument) {
            return photoshop.core.showAlert("Please create a document first, to use the toolbar.");
        }

        // set the layer colour and update layerEffects
        const actions: ActionDescriptor[] = [
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "layer",
                        "_enum": "ordinal",
                        "_value": "targetEnum"
                    }
                ],
                "to": {
                   "_obj": "layer",
                   "color": {
                        "_enum": "color",
                        "_value": props.colour
                   }
                },
            },
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "property",
                        "_property": "layerEffects"
                    },
                    {
                        "_ref": "layer",
                        "_enum": "ordinal",
                        "_value": "targetEnum"
                    }
                ],
                "to": {
                    "_obj": "layerEffects",
                },
             }
        ]

        photoshop.core.executeAsModal(async () => {
            // gets layer blending options
            const _blendingOptions: ActionDescriptor[] = await photoshop.action.batchPlay([
                {
                    "_obj": "get",
                    "_target": [
                        {
                            "_ref": "property",
                            "_property": "layerEffects"
                        },
                        {
                            "_ref": "layer",
                            "_enum": "ordinal",
                            "_value": "targetEnum"
                        }
                    ],
                }
            ], {});

            const selectedLayers: Layer[] = currentDocument.activeLayers

            if (selectedLayers.length === 0) {
                return photoshop.core.showAlert("Could not apply colour overlay to the layer because no layers are selected.");
            } else if (selectedLayers.length > 1) {
                return photoshop.core.showAlert("Could not apply colour overlay to the layer because more than one layer is selected.");
            }
    
            // if no layerEffects are present, just add solidFill
            if (!_blendingOptions[0]?.layerEffects) {
                if (props.colour === "none") {
                    return
                }

                 actions[1]["to"].solidFill = {
                    "_obj":  "solidFill",
                    "enabled": true,
                    "present": true,
                    "showInDialog": true,
                    "mode": {
                        "_enum": "blendMode",
                        "_value": "normal"
                    },
                    "color": {
                        "_obj": "RGBColor",
                         ...colorData[props.colour as keyof coloursContainer]
                    },
                    "opacity": {
                        "_unit": "percentUnit",
                        "_value": 100
                    }
                }
            } else {
                // if there is one solidFill
                if (_blendingOptions[0]?.layerEffects?.solidFill) {
                    // check if colour overlay was applied
                    if (checkIfHasColourOverlay(_blendingOptions[0].layerEffects.solidFill.color)) {
                        if (props.colour === "none") {
                            delete(_blendingOptions[0].layerEffects.solidFill)
                        } else {
                            _blendingOptions[0].layerEffects.solidFill = {
                                "_obj": "solidFill",
                                "enabled": true,
                                "present": true,
                                "showInDialog": true,
                                "mode": {
                                    "_enum": "blendMode",
                                    "_value": "normal"
                                },
                                "color": {
                                    "_obj": "RGBColor",
                                    ...colorData[props.colour as keyof coloursContainer]
                                },
                                "opacity": {
                                    "_unit": "percentUnit",
                                    "_value": 100
                                }
                            }
                        }
                    } else {
                        if (props.colour === "none") {
                            return
                        }
    
                        // if solidFill was created by user, we now create solidFillMulti
                        _blendingOptions[0].layerEffects.solidFillMulti = [
                            {
                                "_obj": "solidFill",
                                "enabled": true,
                                "present": true,
                                "showInDialog": true,
                                "mode": {
                                    "_enum": "blendMode",
                                    "_value": "normal"
                                },
                                "color": {
                                    "_obj": "RGBColor",
                                    ...colorData[props.colour as keyof coloursContainer]
                                },
                                "opacity": {
                                    "_unit": "percentUnit",
                                    "_value": 100
                                }
                            }
                        ]
    
                        // restore user's fill
                        _blendingOptions[0].layerEffects.solidFillMulti.push(_blendingOptions[0].layerEffects.solidFill)
    
                        // cleanup 
                        delete(_blendingOptions[0].layerEffects.solidFill)
                    }
                } else if (_blendingOptions[0]?.layerEffects?.solidFillMulti) { // if there are multiple colour fills
                    let found = -1

                    // check if colour oberlay was applied
                    _blendingOptions[0].layerEffects.solidFillMulti.forEach((colourOverlay: any, index: number) => {
                        if (found !== -1) { return } 
                        // if colour overlay is present, we change the colour
                        if (checkIfHasColourOverlay(colourOverlay.color)) {
                            if (props.colour !== "none") {
                                _blendingOptions[0].layerEffects.solidFillMulti[index] = {
                                    "_obj": "solidFill",
                                    "enabled": true,
                                    "present": true,
                                    "showInDialog": true,
                                    "mode": {
                                        "_enum": "blendMode",
                                        "_value": "normal"
                                    },
                                    "color": {
                                        "_obj": "RGBColor",
                                        ...colorData[props.colour as keyof coloursContainer]
                                    },
                                    "opacity": {
                                        "_unit": "percentUnit",
                                        "_value": 100
                                    }
                                }
                            }
    
                            found = index
                        }
                    })
    
                    if (props.colour === "none" && found !== -1) {
                        // remove the colour from array once we finish the looo
                        _blendingOptions[0].layerEffects.solidFillMulti.splice(found, 1)
                    } else if (found === -1 && props.colour !== "none") {
                        // add fill if it wasn't found
                        _blendingOptions[0].layerEffects.solidFillMulti.unshift({
                            "_obj": "solidFill",
                            "enabled": true,
                            "present": true,
                            "showInDialog": true,
                            "mode": {
                                "_enum": "blendMode",
                                "_value": "normal"
                            },
                            "color": {
                                "_obj": "RGBColor",
                                ...colorData[props.colour as keyof coloursContainer]
                            },
                            "opacity": {
                                "_unit": "percentUnit",
                                "_value": 100
                            }
                        })
                    }
                }
    
                Object.assign(actions[1]["to"], _blendingOptions[0].layerEffects)
            }

            return photoshop.action.batchPlay(actions, {});
        }, {"commandName": "countSelectedLayers"})
    }

    return (
        <>
            <Button 
                onClicked ={ onClick }
                label = { props.label }
                imgSrc= { iconsPath[props.colour as keyof iconsPath] }
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default ColourOverlayButton