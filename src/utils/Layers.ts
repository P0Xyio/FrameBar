import { Layer } from "photoshop/dom/Layer";
/**
 * Gets layer by given Id
 * @param id - id of the layer
 * @param layers - layers to search
 * @returns found layer or undefined
 */
export function getLayerById(id: number, layers: Layer[]):Layer {
    let foundLayer: Layer

    layers.forEach((layer: Layer) => {
        if (foundLayer) { return }
        if (layer.layers) {
            foundLayer = getLayerById(id, layer.layers)
        }
        
        if (layer.id === id) {
            foundLayer = layer
        }
    })

    return foundLayer
}