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

/**
 * check if the colour overlay is present 
 * as we are applying only the edge colours, there should be one 255 and two zeros in the RGB
 * @param colourOverlay 
 * @returns 
 */
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

const ColourOverlayButton:React.FunctionComponent<Props> = (props: Props) => {
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
            const selectedLayers: Layer[] = currentDocument.activeLayers

            if (selectedLayers.length === 0) {
                return photoshop.core.showAlert("Could not apply colour overlay to the layer because no layers are selected.");
            } else if (selectedLayers.length > 1) {
                return photoshop.core.showAlert("Could not apply colour overlay to the layer because more than one layer is selected.");
            }

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

            const effects = _blendingOptions[0]?.layerEffects
            const colour = props.colour
            const hasSolidFill = effects?.solidFill
            const hasMultipleFills = effects?.solidFillMulti

            const newSolidFill = {
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
                    ...colorData[colour as keyof coloursContainer]
                },
                "opacity": {
                    "_unit": "percentUnit",
                    "_value": 100
                }
            }

            // if no layerEffects are present, just add solidFill
            if (!effects && colour !== "none") {
                actions[1]["to"].solidFill = newSolidFill
            } else if (hasSolidFill) { // if there is one solidFill
                const overlayApplied = checkIfHasColourOverlay(effects.solidFill.color);
            
                if (colour === "none" && overlayApplied) {
                    delete(effects.solidFill)
                } else if (overlayApplied) {
                    effects.solidFill = newSolidFill
                } else if (colour !== "none") {
                    effects.solidFillMulti = [newSolidFill, effects.solidFill]
                    delete(effects.solidFill)
                }
            } else if (hasMultipleFills) { // if there are multiple colour fills
                const overlayIndex = effects.solidFillMulti.findIndex((colourOverlay: any) => checkIfHasColourOverlay(colourOverlay.color))

                if (overlayIndex !== -1) {
                    if (colour !== "none") {
                        // if colour overlay is present, we change the colour
                        effects.solidFillMulti[overlayIndex] = newSolidFill
                    } else {
                        // remove the colour overlay
                        effects.solidFillMulti.splice(overlayIndex, 1)
                    }
                } else if (colour !== "none") {
                    // add fill if it wasn't found
                    effects.solidFillMulti.unshift(newSolidFill)
                }
            }

            if (effects) {
                Object.assign(actions[1]["to"], effects)
            }

            return photoshop.action.batchPlay(actions, {});
        }, {"commandName": "Applying colour overlay"})
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