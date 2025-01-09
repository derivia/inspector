class DesignInspector {
	constructor() {
		this.active = false;
		this.setupListeners();
		this.generateDepthStyles();
	}

	/** Generate different colors for elements based on their depth on DOM tree */
	generateDepthStyles() {
		const baseStyles = [];
		const hueStep = 200 / 10;

		for (let depth = 0; depth <= 10; depth++) {
			const hue = depth * hueStep;
			baseStyles.push(`
                [data-depth="${depth}"] {
                    outline: 1px solid hsla(${hue}, 80%, 50%, 0.6) !important;
                    outline-offset: -1px !important;
                }
            `);
		}

		this.styles = baseStyles.join("\n");
	}

	/** Add listeners for extension-icon click
	 * Send messages and insert CSS on tabs based on tab.id
	 * Toggles the content script workarounds
	 */
	setupListeners() {
		browser.browserAction.onClicked.addListener(async (tab) => {
			this.active = !this.active;
			if (this.active) {
				await browser.tabs.insertCSS(tab.id, {
					code: this.styles,
					cssOrigin: "user",
				});
				await browser.tabs.insertCSS(tab.id, {
					code: `
                        .inspector-hover {
                            outline: 2px dashed orange !important;
                            outline-offset: -2px !important;
                            z-index: 2147483646 !important;
                        }
                    `,
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
				await browser.tabs.removeCSS(tab.id, {
					code: `
                        .inspector-hover {
                            outline: 2px dashed orange !important;
                            outline-offset: -2px !important;
                            z-index: 2147483646 !important;
                        }
                    `,
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
