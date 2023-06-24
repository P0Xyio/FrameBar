import * as React from "react";
import { render } from 'react-dom';
import NewDocument from "../panels/NewDocument";
import Button from './Button';
import photoshop from "@utils/Photoshop";
import { createDialog } from "@utils/Dialog";
import { constants } from "photoshop"
import { Layer } from "photoshop/dom/Layer";
import { DocumentCreateOptions } from "photoshop/dom/types/DocumentTypes"
import { ActionDescriptor } from "photoshop/dom/CoreModules";
interface Props {
    bindClick: boolean,
    uiTheme: string,
    description: string,
}

interface SizeParams {
    width: number;
    height: number
}
interface ModalParams {
    title: string;
    size: SizeParams
}
declare global {
    interface HTMLDialogElement {
        uxpShowModal(params: ModalParams): void;
    }
}

const CreateAnimationButton:React.FunctionComponent<Props> = (props: Props) => {
    const onClick = async () => {
        const result = await createDialog("createProjectDialog", "Create new project", <NewDocument/>, { width: 480, height: 320 })
        if (result === "reasonCanceled") { return }
        const params = JSON.parse(result)

        const documentSettings: DocumentCreateOptions = {
            name: params.projectName,
            width: params.width, 
            height: params.height, 
            resolution: params.resolution, 
            mode: params.mode, 
            depth: params.depth,
            fill: params.fill
        }

        // if custom colour was used
        if (params.fill === constants.DocumentFill.COLOR) {
            const SolidColor = photoshop.app.SolidColor;
            const color = new SolidColor()
            color.rgb.red = params.customColor.r
            color.rgb.green = params.customColor.g
            color.rgb.blue = params.customColor.b
            
            documentSettings.fillColor = color
        }

        photoshop.core.executeAsModal(async () => {
            await photoshop.app.documents.add(documentSettings); // create new document
            await photoshop.app.activeDocument.layers.add(); // add first layer
            await photoshop.action.batchPlay([{ "_obj": "makeTimeline" }], {}); // add timeline

            const _timelineData: ActionDescriptor[] = await photoshop.action.batchPlay([{
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
            }], {});

            if (!_timelineData) { return }
            if (!_timelineData?.[0]) { return }
            const timelineData = _timelineData[0];
            
            // set timeline framerate
            await photoshop.action.batchPlay([{
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "property",
                        "_property": "documentTimelineSettings"
                    },
                    {
                        "_ref": "timeline"
                    }
                ],
                "frameRate": params.framerate
            }], {});
            
            // create layer and shrink it
            await photoshop.action.batchPlay([
                {"_obj":"make","_target":[{"_ref":"sceneSection"}],"name":"Animation"},
                {"_obj":"make","_target":[{"_ref":"layer"}]},
                {"_obj":"moveOutTime","timeOffset":{"_obj":"timecode","frame":(params.framerate * -1) + 1,"frameRate":params.framerate,"seconds":(timelineData.duration.seconds * -1) + 1}},
            ], {});
            
            // remove unwanted layers
            photoshop.app.activeDocument.layers.forEach((layer: Layer) => {
                if (layer.kind !== constants.LayerKind.GROUP && layer.locked !== true) {
                    layer.delete()
                }
            })
        }, {"commandName": "Creating a new document"});
    }

    return (
        <>
            <Button 
                onClicked={ onClick }
                label="Create"
                imgSrc="createNewTimeline"
                bindClick = { props.bindClick }
                uiTheme = { props.uiTheme }
                description = { props.description }
            />
        </>
    )
}

export default CreateAnimationButton