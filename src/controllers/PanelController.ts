import { Root, createRoot } from 'react-dom/client';

export class PanelController {
    menuItems: any[];
    #component: JSX.Element;
    #root: Root | null;
    #container: HTMLElement | null;

    constructor(component: JSX.Element, menuItems?: any[]) {
        this.#component = component;
        this.menuItems = menuItems || [];

        this.create = this.create.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.destroy = this.destroy.bind(this);
        this.invokeMenu = this.invokeMenu.bind(this);
    }
  
    create(rootNode:HTMLElement) {
        this.#container = document.createElement("div");
        this.#container.style.display = "none"
        rootNode.appendChild(this.#container)

        this.#root = createRoot(this.#container);
        this.#root.render(this.#component);
    }

    show(rootNode:HTMLElement, data:any) {
        this.#container.style.display = "block"
    }

    hide(rootNode:HTMLElement, data:any) {
        this.#container.style.display = "none"
    }

    destroy(rootNode:HTMLElement) {
        this.#root.unmount()
        rootNode.removeChild(this.#container)
    }

    invokeMenu(menuId: string) {
        const menuItem = this.menuItems.find(c => c.id === menuId);
        if (!menuItem) { return }
        if (!menuItem.oninvoke || typeof menuItem.oninvoke !== "function") { return }

        menuItem.oninvoke();
    }
}
