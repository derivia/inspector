class DesignInspector {
	constructor() {
		this.active = false;
		this.setupListeners();
		this.generateDepthStyles();
	}

	generateDepthStyles() {
		const baseStyles = [];
		const hueStep = 200 / 10;

		for (let depth = 0; depth <= 10; depth++) {
			const hue = depth * hueStep;
			baseStyles.push(`
                *:nth-child(n) ${":nth-child(n) ".repeat(depth)} {
                    outline: 1px solid hsla(${hue}, 80%, 50%, 0.6) !important;
                    outline-offset: -1px !important;
                }
            `);
		}

		this.styles = baseStyles.join("\n");
	}

	setupListeners() {
		browser.browserAction.onClicked.addListener(async (tab) => {
			this.active = !this.active;
			if (this.active) {
				await browser.tabs.insertCSS(tab.id, {
					code: this.styles,
					cssOrigin: "user",
				});
				await browser.tabs.executeScript(tab.id, {
					code: `
                const style = document.createElement('style');
                style.id = 'inspector-hover-style';
                style.textContent = '.inspector-hover { outline: 2px dashed orange !important; outline-offset: -2px !important; z-index: 2147483646 !important; }';
                document.head.appendChild(style);
                
                document.querySelectorAll('*').forEach(el => {
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
            `,
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
				await browser.tabs.executeScript(tab.id, {
					code: `
                    const style = document.getElementById('inspector-hover-style');
                    if (style) style.remove();
                `,
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
