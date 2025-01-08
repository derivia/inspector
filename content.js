let elementInspector;

browser.runtime.onMessage.addListener((message) => {
	if (message.type === "toggle") {
		if (message.active) {
			if (!elementInspector) {
				elementInspector = new ElementInspector();
			}
			elementInspector.isActive = true;
		} else {
			if (elementInspector) {
				elementInspector.cleanup();
				elementInspector = null;
			}
		}
	}
});

class ElementInspector {
	constructor() {
		this.infoPanel = this.createInfoPanel();
		this.isCtrlPressed = false;
		this.isActive = false;
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.setupListeners();
	}

	createInfoPanel() {
		const panel = document.createElement("infoPanel");
		panel.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.90);
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

	handleKeyDown(e) {
		if (this.isActive && (e.key === "Control" || e.ctrlKey)) {
			this.isCtrlPressed = true;
			this.infoPanel.style.display = "block";
		}
	}

	handleKeyUp(e) {
		if (this.isActive && (e.key === "Control" || e.ctrlKey)) {
			this.isCtrlPressed = false;
			this.infoPanel.style.display = "none";
		}
	}

	handleMouseMove(e) {
		if (this.isActive && this.isCtrlPressed) {
			const element = document.elementFromPoint(e.clientX, e.clientY);
			if (!element) return;

			const selector = [
				element.tagName.toLowerCase(),
				element.id ? ` #${element.id}` : "",
				...Array.from(element.classList).map((c) => ` .${c}`),
			].join("");

			this.infoPanel.textContent = selector;
		}
	}

	setupListeners() {
		document.addEventListener("keydown", this.handleKeyDown);
		document.addEventListener("keyup", this.handleKeyUp);
		document.addEventListener("mousemove", this.handleMouseMove);
	}

	cleanup() {
		this.isActive = false;
		this.isCtrlPressed = false;
		this.infoPanel.style.display = "none";
		document.removeEventListener("keydown", this.handleKeyDown);
		document.removeEventListener("keyup", this.handleKeyUp);
		document.removeEventListener("mousemove", this.handleMouseMove);
		document.body.removeChild(this.infoPanel);
	}
}
