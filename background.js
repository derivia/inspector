class DesignInspector {
	constructor() {
		this.active = false;
		this.setupListeners();
		// @TODO: fix this color style
		this.styles = `
            * {
                outline: 1px dotted rgba(255, 0, 0, 0.6) !important;
            }
            * > * {
                outline: 1px dotted rgba(0, 255, 0, 0.6) !important;
            }
            * > * > * {
                outline: 1px dotted rgba(0, 0, 255, 0.6) !important;
            }
            *:hover {
                outline: 2px dashed rgba(255, 80, 0, 0.8) !important;
            }
        `;
	}

	setupListeners() {
		browser.browserAction.onClicked.addListener(async (tab) => {
			this.active = !this.active;

			if (this.active) {
				await browser.tabs.insertCSS(tab.id, {
					code: this.styles,
					cssOrigin: "user",
				});
				await browser.tabs.sendMessage(tab.id, {
					type: "toggle",
					active: true,
				});
			} else {
				await browser.tabs.removeCSS(tab.id, {
					code: this.styles,
					cssOrigin: "user",
				});
				await browser.tabs.sendMessage(tab.id, {
					type: "toggle",
					active: false,
				});
			}
		});
	}
}

new DesignInspector();
