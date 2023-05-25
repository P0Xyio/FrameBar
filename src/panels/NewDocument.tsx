import * as React from "react";
import * as Spectrum from "react-uxp-spectrum"
import { WC } from '@utils/WC'
import '../components/NewDocument.css'

interface RGBColor {
    r: number
    g: number
    b: number
}

const NewDocument:React.FunctionComponent = () => {
    const photoshop = require('photoshop')
    const newDocumentMode = photoshop.constants.NewDocumentMode
    const documentFill = photoshop.constants.DocumentFill

    //document properties
    const [inputs, setInputs] = React.useState({
        projectName: "Untitled",
        width: 1920,
        height: 1080,
        resolution: 300,
        mode: newDocumentMode["RGB"],
        depth: 8,
        fill: documentFill["WHITE"],
        customColor: { r: 255, g: 255, b: 255 },
        framerate: 29.97
    })

    const changeInputs = (name: string, value: string | number) => {
        setInputs(values => ({ ...values, [name]: value }))
    }

    // internal function for opening native colour picker
    async function _openColorPicker() {
        return await photoshop.action.batchPlay([{
            _target: { _ref: "application" },
            _obj: "showColorPicker",
            context: "New Project Background Color",
            color: {
                _obj: 'RGBColor',
                red: inputs.customColor["r"],
                green: inputs.customColor["g"],
                blue: inputs.customColor["b"],
            },
        }], {});
    }

    // wrapper function that opens the colour picker and handles the output
    const openColorPicker = async () => {
        try {
            const _result = await photoshop.core.executeAsModal(_openColorPicker, {"commandName": "openColorPicker"});
            const rgbFloat = _result[0]?.RGBFloatColor
            const hasChanged = _result[0]?.value

            if (hasChanged === false) { return changeInputs("fill", inputs.fill) }
            setInputs(values => ({ ...values, ["customColor"]: {r: rgbFloat.red, g: rgbFloat.grain, b: rgbFloat.blue} }))
            changeInputs("fill", documentFill["COLOR"])
        } catch (e) { console.error(e) }
    }

    // const sizeOptions = [
    //     { label: 'Pixels' },
    //     { label: 'Inches' },
    //     { label: 'Centimeters' },
    //     { label: 'Millimeters' },
    //     { label: 'Points' },
    //     { label: 'Picas' },
    // ];

    // const resolutionOptions = [
    //     { label: 'Pixels/Inch' },
    //     { label: 'Pixels/Centimeter' },
    // ];

    const colorModeOptions: { label: string, value: typeof newDocumentMode}[] = [
        { label: 'Grayscale', value: newDocumentMode["GRAYSCALE"] },
        { label: 'RGB Color', value: newDocumentMode["RGB"] },
        { label: 'CMYK Color', value: newDocumentMode["CMYK"] },
        { label: 'Lab Color', value: newDocumentMode["LAB"] },
    ];

    const colorModeDepth: { [key in typeof newDocumentMode]: number[] } = {
        [newDocumentMode["GRAYSCALE"]]: [ 8, 16, 32 ],
        [newDocumentMode["RGB"]]: [ 8, 16, 32 ],
        [newDocumentMode["CMYK"]]: [ 8, 16 ],
        [newDocumentMode["LAB"]]: [ 8, 16 ],
    }

    const frameRateOptions: { label: string, value: number }[] = [
        { label: '10', value: 10 },
        { label: '12', value: 12 },
        { label: '12.5', value: 12.5 },
        { label: '15', value: 15 },
        { label: '23.976', value: 23.976 },
        { label: '24', value: 24 },
        { label: '25', value: 25 },
        { label: '29.97', value: 29.97 },
        { label: '30', value: 30 },
        { label: '50', value: 50 },
        { label: '59.94', value: 59.94 },
        { label: '60', value: 60 },
    ];

    const backgroundColorOptions: { label: string, value: typeof documentFill, color?: RGBColor }[] = [
        { label: 'White', value: documentFill["WHITE"], color: { r: 255, g: 255, b: 255 } },
        { label: 'Black', value: documentFill["BLACK"], color: { r: 0, g: 0, b: 0 } },
        { label: 'Background color', value: documentFill["BACKGROUNDCOLOR"] },
        { label: 'Transparent', value: documentFill["TRANSPARENT"] },
    ]

    // helper function for handling inputs
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.id;
        const value = parseFloat(event.target.value) || event.target.value;

        changeInputs(name, value)
    }

    // handling picker changes
    const handlePickerChange = (event: any) => {
        const pickerId = event.target.id
        const selectedIndex = event.target.selectedIndex
        if (!pickerId) { return }
        
        switch(pickerId) {
            case "framerate-picker": {
                if (frameRateOptions[selectedIndex]) {
                    changeInputs("framerate", frameRateOptions[selectedIndex].value)
                }
                break
            }
            case "colorMode": {
                if (colorModeOptions[selectedIndex]) {
                    changeInputs("mode", colorModeOptions[selectedIndex].value)
                    changeInputs("depth", 8)
                }
                break
            }
            case "colorModeDepth": {
                if (colorModeDepth[inputs.mode] && colorModeDepth[inputs.mode][selectedIndex]) {
                    changeInputs("depth", colorModeDepth[inputs.mode][selectedIndex])
                }
                break
            }
            case "backgroundColor": {
                if (backgroundColorOptions[selectedIndex]) {
                    changeInputs("fill", backgroundColorOptions[selectedIndex].value)

                    if (backgroundColorOptions[selectedIndex].color) {
                        setInputs(values => ({ ...values, ["customColor"]: backgroundColorOptions[selectedIndex].color }))
                    } else if (backgroundColorOptions[selectedIndex].value === documentFill["BACKGROUNDCOLOR"]) {
                        setInputs(values => ({ ...values, ["customColor"]: { r: photoshop.app.backgroundColor.rgb.red, g: photoshop.app.backgroundColor.rgb.green, b: photoshop.app.backgroundColor.rgb.blue } }))
                    }
                } else if (inputs.fill !== documentFill["COLOR"]) {
                    openColorPicker()
                }
                break
            }
            default: break
        }
    }

    return (
        <form method="dialog">
            <Spectrum.Heading>Create new project</Spectrum.Heading>
            <Spectrum.Divider size="large"></Spectrum.Divider>
            <WC onChange={handleInputChange}>
                <Spectrum.Textfield
                    id="projectName"
                    placeholder="Enter project name"
                    value={inputs.projectName || ""}
                >
                    <Spectrum.Label slot="label" isRequired={true}>Project name</Spectrum.Label>
                </Spectrum.Textfield>
            </WC>

            <div className="inputsWrapper">
                <div>
                    <WC onChange={handleInputChange}>
                        <Spectrum.Textfield
                            id="width"
                            placeholder="Width"
                            type="number"
                            value={inputs.width || ""}
                        >
                            <Spectrum.Label slot="label" isRequired={true}>Width</Spectrum.Label>
                        </Spectrum.Textfield>
                    </WC>
                </div>
                {/* <div>
                    <Spectrum.Picker id="size-picker" onChange={ handlePickerChange }>
                        <Spectrum.Menu slot="options">
                            {sizeOptions.map((option, index) => (
                                <Spectrum.MenuItem selected={index === 0}>{option.label}</Spectrum.MenuItem>
                            ))}
                        </Spectrum.Menu>
                    </Spectrum.Picker>
                </div> */}
            </div>

            <WC onChange={handleInputChange}>
                <Spectrum.Textfield
                    id="height"
                    placeholder="Height"
                    type="number"
                    value={inputs.height || ""}
                >
                    <Spectrum.Label slot="label" isRequired={true}>Height</Spectrum.Label>
                </Spectrum.Textfield>
            </WC>
            <div className="inputsWrapper">
                <div>
                    <WC onChange={handleInputChange}>
                        <Spectrum.Textfield
                            id="resolution"
                            placeholder="Resolution"
                            type="number"
                            value={inputs.resolution || ""}
                        >
                            <Spectrum.Label slot="label" isRequired={true}>Resolution</Spectrum.Label>
                        </Spectrum.Textfield>
                    </WC>
                </div>
                {/* <div>
                    <Spectrum.Picker id="resolution-picker" onChange={ handlePickerChange }>
                        <Spectrum.Menu slot="options">
                            {resolutionOptions.map((option, index) => (
                                <Spectrum.MenuItem selected={index === 0}>{option.label}</Spectrum.MenuItem>
                            ))}
                        </Spectrum.Menu>
                    </Spectrum.Picker>
                </div> */}
            </div>
            <div className="inputsWrapper">
                <div>
                    <Spectrum.Picker id="colorMode" onChange={ handlePickerChange }>
                        <Spectrum.Menu slot="options">
                            {colorModeOptions.map((option) => (
                                <Spectrum.MenuItem selected={option.value === inputs.mode}>{option.label}</Spectrum.MenuItem>
                            ))}
                        </Spectrum.Menu>
                        <Spectrum.Label slot="label" isRequired={true}>Color Mode</Spectrum.Label>
                    </Spectrum.Picker>
                </div>
                <div>
                    <Spectrum.Picker id="colorModeDepth" onChange={ handlePickerChange }>
                        <Spectrum.Menu slot="options">
                            {colorModeDepth[inputs.mode].map((value) => (
                                <Spectrum.MenuItem selected={value === inputs.depth}>{value} bit</Spectrum.MenuItem>
                            ))}
                        </Spectrum.Menu>
                    </Spectrum.Picker>
                </div>
            </div>
            <div className="inputsWrapper">
                <div>
                    <Spectrum.Picker id="backgroundColor" onChange={ handlePickerChange }>
                        <Spectrum.Menu slot="options">
                            {backgroundColorOptions.map((option) => (
                                <Spectrum.MenuItem selected={option.value === inputs.fill}>{option.label}</Spectrum.MenuItem>
                            ))}
                            <Spectrum.MenuDivider></Spectrum.MenuDivider>
                            <Spectrum.MenuItem selected={backgroundColorOptions.find(option => option.value === inputs.fill) === undefined}>Custom</Spectrum.MenuItem>
                        </Spectrum.Menu>
                        <Spectrum.Label slot="label" isRequired={true}>Background Color</Spectrum.Label>
                    </Spectrum.Picker>
                </div>
                <div 
                    style={{
                        background: inputs.fill === documentFill["TRANSPARENT"] ? "transparent" : `rgb(${inputs.customColor.r}, ${inputs.customColor.g}, ${inputs.customColor.b})`,
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "4px",
                        border: "1px solid var(--uxp-label-color)",
                        marginLeft: "0.7rem",
                        cursor: "pointer"
                    }}
                    onClick = { openColorPicker }
                >
                </div>
            </div>
            <div className="inputsWrapper">
                <div>
                    <WC onChange={handleInputChange}>
                        <Spectrum.Textfield
                            id="framerate"
                            placeholder="Framerate"
                            type="number"
                            value={inputs.framerate || ""}
                        >
                            <Spectrum.Label slot="label" isRequired={true}>Framerate</Spectrum.Label>
                        </Spectrum.Textfield>
                    </WC>
                </div>
                <div>
                    <Spectrum.Picker id="framerate-picker" onChange={ handlePickerChange }>
                        <Spectrum.Menu slot="options">
                            {frameRateOptions.map((option) => (
                                <Spectrum.MenuItem selected={option.value === inputs.framerate}>{option.label}</Spectrum.MenuItem>
                            ))}
                            <Spectrum.MenuDivider></Spectrum.MenuDivider>
                            <Spectrum.MenuItem selected={frameRateOptions.find(option => option.value === inputs.framerate) === undefined}>Custom</Spectrum.MenuItem>
                        </Spectrum.Menu>
                    </Spectrum.Picker>
                </div>
            </div>
            <footer>
                <Spectrum.Button
                    id="cancel"
                    variant="primary"
                    onClick = { () => {
                        const dialogElement: HTMLDialogElement | null = document.getElementById("createProjectDialog") as HTMLDialogElement
                        if (dialogElement) { dialogElement.close('reasonCanceled') }
                    }}
                >
                    Cancel
                </Spectrum.Button>
                <Spectrum.Button
                    id="done"
                    variant="cta"
                    onClick = { () => {
                        const dialogElement: HTMLDialogElement | null = document.getElementById("createProjectDialog") as HTMLDialogElement
                        if (dialogElement) { dialogElement.close(JSON.stringify(inputs)) }
                    }}
                >
                    Create
                </Spectrum.Button>
            </footer>
        </form>
    )
}

export default NewDocument