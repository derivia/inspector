class ElementInspector {
	constructor() {
		this.isCtrlPressed = false;
		this.isActive = false;
		this.currentHoveredElement = null;
		this.infoPanel = this.createInfoPanel();
		this.setupListeners();
	}

	/**
	 * @returns {div} Info panel div that sticks below to the window when CTRL is held
	 */
	createInfoPanel() {
		const panel = document.createElement("div");
		panel.id = "infoPanel";
		panel.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: #EFECEF;
            font-family: monospace;
            padding: 2px 6px 5px 6px;
            z-index: 2147483647;
            font-size: 14px;
            display: none;
            height: 30px;
            line-height: 22px;
        `;
		document.body.appendChild(panel);
		return panel;
	}

	/**
	 * @param {any} e Event when key is down
	 * Enable hover-dashed-border and show info panel
	 */
	handleKeyDown(e) {
		if (!this.isActive) return;
		if (e.key === "Control") {
			this.isCtrlPressed = true;
			this.infoPanel.style.display = "block";
			if (this.currentHoveredElement) {
				this.currentHoveredElement.classList.add("inspector-hover");
			}
		}
	}

	/**
	 * @param {any} e Event when key is up
	 * Disable hover-dashed-border and hide info panel
	 */
	handleKeyUp(e) {
		if (!this.isActive) return;
		if (e.key === "Control") {
			this.isCtrlPressed = false;
			this.infoPanel.style.display = "none";
			if (this.currentHoveredElement) {
				this.currentHoveredElement.classList.remove("inspector-hover");
			}
		}
	}

	/**
	 * @param {any} e Event when mouse is moving
	 * Get current hovered element based on mouse position and apply hover-css style
	 */
	handleMouseMove(e) {
		if (!this.isActive) return;

		if (this.currentHoveredElement) {
			this.currentHoveredElement.classList.remove("inspector-hover");
		}

		this.currentHoveredElement = document.elementFromPoint(
			e.clientX,
			e.clientY,
		);

		if (!this.currentHoveredElement) return;

		if (this.isCtrlPressed) {
			this.currentHoveredElement.classList.add("inspector-hover");

			const selector = [
				this.currentHoveredElement.tagName.toLowerCase(),
				this.currentHoveredElement.id
					? ` #${this.currentHoveredElement.id}`
					: "",
				...Array.from(this.currentHoveredElement.classList)
					.filter((c) => c !== "inspector-hover")
					.map((c) => ` .${c}`),
			].join("");

			this.infoPanel.textContent = selector;
		}
	}

	setupListeners() {
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
		document.addEventListener("mousemove", this.handleMouseMove.bind(this));
	}

	/** Clear extension-related divs and styles when the extension is disabled */
	cleanup() {
		this.isActive = false;
		this.isCtrlPressed = false;
		if (this.currentHoveredElement) {
			this.currentHoveredElement.classList.remove("inspector-hover");
		}
		this.infoPanel.style.display = "none";
		document.removeEventListener("keydown", this.handleKeyDown);
		document.removeEventListener("keyup", this.handleKeyUp);
		document.removeEventListener("mousemove", this.handleMouseMove);
		if (this.infoPanel.parentNode) {
			document.body.removeChild(this.infoPanel);
		}
		this.currentHoveredElement = null;
	}
}

let elementInspector;

/** Message system that manages the content script injection.
 * Creates a element inspector and destroys it based on extension state
 *
 * Based on DOM tree nodes, check depth of Node and add different colors
 */
browser.runtime.onMessage.addListener((message) => {
	if (message.type === "toggle") {
		if (message.active) {
			if (!elementInspector) {
				elementInspector = new ElementInspector();
				elementInspector.isActive = true;

				document.querySelectorAll("*").forEach((el) => {
					el.dataset.depth = getElementDepth(el);
				});

				function getElementDepth(el) {
					let depth = 0;
					let parent = el.parentElement;
					while (parent) {
						depth++;
						parent = parent.parentElement;
					}
					return depth;
				}
			}
		} else {
			if (elementInspector) {
				elementInspector.cleanup();
				elementInspector = null;

				document.querySelectorAll("*").forEach((el) => {
					delete el.dataset.depth;
				});
			}
		}
	}
});
