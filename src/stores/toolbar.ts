import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import TimelineButton from '@components/TimelineButton'
import CreateAnimationButton from '@components/CreateAnimationButton'
import CanvasSizeButton from "@components/CanvasSizeButton";
import NewFrameButton from '@components/NewFrameButton'
import DuplicateLayerButton from '@components/DuplicateLayerButton'
import DeleteLayerButton from "@components/DeleteLayerButton";
import AddVideoGroupButton from '@components/AddVideoGroupButton';
import ColourOverlayButton from "@components/ColourOverlayButton";
import OnionSkinButton from "@components/OnionSkinButton"
import OnionSkinSettingsButton from '@components/OnionSkinSettingsButton'
import MoveFrameButton from "@components/MoveFrameButton";
import SetWorkArenaButton from '@components/SetWorkArenaButton'
import ClearLayerContentButton from '@components/ClearLayerContentButton'
import FlipLayerButton from '@components/FlipLayerButton'

export interface ToolbarButtons {
    id: string,
    component: React.FunctionComponent,
    props: any,
    enabled: boolean,
    description?: string
    group: string
}

type Theme = "D" | "L"
export interface ToolbarProps {
    buttons: ToolbarButtons[],
    uiTheme: Theme
}
  
export interface ToolbarState extends ToolbarProps {
    changeButttonVisibility: (buttonId: string, state: boolean) => void
    changeUiTheme: (theme: Theme) => void
}

const Buttons: ToolbarButtons[] = [
    { 
        id: "toggleTimeline",
        component: TimelineButton, 
        props: {}, 
        enabled: true,
        description: "Toggles the visibility of the timeline.",
        group: "general"
    },
    { 
        id: "createAnimation",
        component: CreateAnimationButton, 
        props: {}, 
        enabled: true,
        description: "Create a new animation project.",
        group: "general"
    },
    { 
        id: "canvasSize",
        component: CanvasSizeButton, 
        props: {}, 
        enabled: true,
        description: "Change canvas size.",
        group: "general"
    },


    
    { 
        id: "addOneFrame",
        component: NewFrameButton, 
        props: { label: "1 Frame", count: 1 }, 
        enabled: true,
        description: "Add one frame to the end.",
        group: "frames"
    },
    { 
        id: "addTwoFrames",
        component: NewFrameButton, 
        props: { label: "2 Frames", count: 2 }, 
        enabled: true,
        description: "Add two frames to the end.",
        group: "frames"
    },
    { 
        id: "duplicateFrame",
        component: DuplicateLayerButton, 
        props: {}, 
        enabled: true,
        description: "Duplicate selected frame.",
        group: "frames"
    },
    { 
        id: "deleteLayer",
        component: DeleteLayerButton, 
        props: {}, 
        enabled: true,
        description: "Delete selected frame.",
        group: "frames"
    },
    { 
        id: "addVideoGroup",
        component: AddVideoGroupButton, 
        props: {}, 
        enabled: true,
        description: "Add video group.",
        group: "frames"
    },

    
    { 
        id: "clearLayerContent",
        component: ClearLayerContentButton, 
        props: {}, 
        enabled: true,
        description: "Clear layer content.",
        group: "layerManipulation" 
    },
    { 
        id: "flipLayer",
        component: FlipLayerButton, 
        props: {}, 
        enabled: true,
        description: "Flip layer horizontally.",
        group: "layerManipulation" 
    },
    { 
        id: "toggleOnionSkin",
        component: OnionSkinButton, 
        props: {}, 
        enabled: true,
        description: "Toggle onion skin.",
        group: "layerManipulation"
    },
    { 
        id: "openOnionSkinSettings",
        component: OnionSkinSettingsButton, 
        props: {}, 
        enabled: true,
        description: "Change onion skin settings.",
        group: "layerManipulation"
    },



    { 
        id: "redColourOverlay",
        component: ColourOverlayButton, 
        props: { label: "Red", colour:"red" }, 
        enabled: true,
        description: "Apply red colour overlay.",
        group: "colourOverlay"
    },
    { 
        id: "greenColourOverlay",
        component: ColourOverlayButton, 
        props: { label: "Green", colour:"grain" }, 
        enabled: true,
        description: "Apply green colour overlay.",
        group: "colourOverlay"
    },
    { 
        id: "blueColourOverlay",
        component: ColourOverlayButton, 
        props: { label: "Blue", colour:"blue" }, 
        enabled: true,
        description: "Apply blue colour overlay.",
        group: "colourOverlay"
    },
    { 
        id: "clearColourOverlay",
        component: ColourOverlayButton, 
        props: { label: "None", colour:"none" }, 
        enabled: true,
        description: "Clear layer colour overlay.",
        group: "colourOverlay"
    },



    { 
        id: "moveFrameForwards",
        component: MoveFrameButton, 
        props: { direction: "Forward" }, 
        enabled: true,
        description: "Move frame forwards.",
        group: "workspace"
    },
    { 
        id: "moveFrameBackrwards",
        component: MoveFrameButton, 
        props: { direction: "Backward" }, 
        enabled: true,
        description: "Move frame backwards.",
        group: "workspace"
    },
    { 
        id: "setStartWorkArena",
        component: SetWorkArenaButton, 
        props: { side: "start" }, 
        enabled: true,
        description: "Set beginning of the work arena playback.",
        group: "workspace" 
    },
    { 
        id: "setEndWorkArena",
        component: SetWorkArenaButton, 
        props: { side: "end" }, 
        enabled: true,
        description: "Set end of the work arena playback.",
        group: "workspace" 
    },
    { 
        id: "clearWorkArena",
        component: SetWorkArenaButton, 
        props: { side: "clear" }, 
        enabled: true,
        description: "Clear work arena playback restrictions.",
        group: "workspace"  
    },

]

const DEFAULT_PROPS: ToolbarProps = {
    buttons: Buttons,
    uiTheme: "L"
}

const createToolbarStore = create<ToolbarState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_PROPS,
            changeButttonVisibility: (buttonId: string, state: boolean) => {
                const updatedButtons = get().buttons.map((button, index) =>
                    button.id === buttonId ? { ...button, enabled: state } : button
                );
                set({ buttons: updatedButtons });
            },
            changeUiTheme: (theme: Theme) => {
                set({ uiTheme: theme })
            }
        }),
        {
            name: 'framebar-storage',
            partialize: (state: ToolbarState) => {
                // store only the buttonid and whether it is enabled
                const buttons = state.buttons.reduce((current, element) => ({ ...current, [element.id]: element.enabled}), {}) 

                return { buttons }
            },
            
            merge: (persistedState:any, currentState: ToolbarState): ToolbarState => {
                // Merge persisted state with current state
                // as we are only saving the button active state, we are merging it with the buttons obejct
                const updatedButtons = currentState.buttons.map((button) => {
                    if (
                        persistedState.buttons &&
                        typeof persistedState.buttons[button.id] === "boolean"
                    ) {
                        return { ...button, enabled: persistedState.buttons[button.id] };
                    }

                    return button;
                })
                
                return {
                    ...currentState,
                    ...persistedState,
                    buttons: updatedButtons,
                };
            }
        }
    )
)

export default createToolbarStore