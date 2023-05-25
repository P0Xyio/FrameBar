import * as React from "react";
import * as Spectrum from "react-uxp-spectrum"
interface Props {
    label: string,
    imgSrc: string,
    bindClick: boolean,
    description: string,
    uiTheme?: string,
    onClicked?: () => void
}

const Button:React.FunctionComponent<Props> = (props: Props) => {
    return (
        <>
            <Spectrum.ActionButton
                onClick = { props.bindClick ? props.onClicked : undefined }
                quiet 
                size="l"
                title={ props.description }   
            >
                <sp-asset 
                    style={{
                        height: "2.5rem",
                        width: "2.5rem"
                    }} 
                >
                    <img 
                        src = { `./icons/${props.imgSrc}_${props.uiTheme || "D"}.png` }
                        alt = { props.label }                   
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            display: "block"
                        }} 
                    />
                </sp-asset>
            </Spectrum.ActionButton>
        </>
    )
}
export default Button