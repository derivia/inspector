class ElementInspector {
	constructor() {
		this.infoPanel = this.createInfoPanel();
		this.isCtrlPressed = false;
		this.isActive = false;
		this.currentHoveredElement = null;
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
		if (!this.isActive) return;
		if (e.key === "Control" || e.ctrlKey) {
			this.isCtrlPressed = true;
			this.infoPanel.style.display = "block";
			this.currentHoveredElement.classList.add("inspector-hover");
		}
	}

	handleKeyUp(e) {
		if (!this.isActive) return;
		if (e.key === "Control" || e.ctrlKey) {
			this.isCtrlPressed = false;
			this.infoPanel.style.display = "none";
			this.currentHoveredElement.classList.remove("inspector-hover");
		}
	}

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
		if (!this.isActive) return;
		document.addEventListener("keydown", this.handleKeyDown);
		document.addEventListener("keyup", this.handleKeyUp);
		document.addEventListener("mousemove", this.handleMouseMove);
	}

	cleanup() {
		this.isActive = !this.isActive;
		this.isCtrlPressed = !this.isActive;
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

browser.runtime.onMessage.addListener((message) => {
	if (message.type === "toggle") {
		if (!elementInspector) {
			elementInspector = new ElementInspector();
			elementInspector.isActive = true;
			elementInspector.setupListeners();
		} else {
			elementInspector.cleanup();
			elementInspector = null;
		}
	}
});
