import * as React from "react";
import { render } from 'react-dom';
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
        uxpShowModal(params: ModalParams): Promise<void>
    }
}

let dialog: HTMLDialogElement
/**
 * Creates a dialog menu. Only one can be open at a time
 * @param id - unique id for the Dialog
 * @param title - dialog title
 * @param component - React component as a JSX Element
 * @param size - object that contains width and height
 * @returns result passed from the dialog
 */
export async function createDialog(id: string, title: string, component: JSX.Element, size?: SizeParams): Promise<any> {
    if (dialog) { return }

    dialog = document.createElement("dialog");
    dialog.id = id
    
    render(component, dialog)

    const result = await document.body.appendChild(dialog).uxpShowModal({
        title: title,
        size: {
            width: size?.width || 720,
            height: size?.height || 320
        }
    })

    dialog.remove()
    dialog = null

    return result
}
