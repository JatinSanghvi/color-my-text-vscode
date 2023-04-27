import * as vscode from 'vscode';
import { minimatch, MinimatchOptions } from 'minimatch';

export function activate(context: vscode.ExtensionContext): void {
	console.log('Extension "color-my-text" is activated.');

	type Configuration = {
		paths?: string[],
		rules?: Rule[],
	};

	type Rule = {
		patterns?: string[];
		color?: Color;
		matchCase?: boolean;
		matchWholeWord?: boolean;
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		strikeThrough?: boolean;
	};

	enum Color {
		black = 'Black',
		blue = 'Blue',
		brightBlack = 'BrightBlack',
		brightBlue = 'BrightBlue',
		brightCyan = 'BrightCyan',
		brightGreen = 'BrightGreen',
		brightMagenta = 'BrightMagenta',
		brightRed = 'BrightRed',
		brightWhite = 'BrightWhite',
		brightYellow = 'BrightYellow',
		cyan = 'Cyan',
		green = 'Green',
		magenta = 'Magenta',
		red = 'Red',
		white = 'White',
		yellow = 'Yellow',
	}

	let todoEditors: vscode.TextEditor[];
	let doneEditors: vscode.TextEditor[];
	let allDecorationTypes: vscode.TextEditorDecorationType[][] = [];

	function resetDecorations(): void {
		todoEditors = vscode.window.visibleTextEditors.slice();
		doneEditors = [];

		// Clear all decorations.
		todoEditors.forEach(todoEditor =>
			allDecorationTypes.flat().forEach(decorationType =>
				todoEditor.setDecorations(decorationType, [])));

		// Refresh decoration-type map.
		const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
		allDecorationTypes = !Array.isArray(configurations)
			? []
			: configurations.map(configuration => !Array.isArray(configuration.rules)
				? []
				: configuration.rules.map(rule => vscode.window.createTextEditorDecorationType({
					color: !Object.values(Color).includes(rule.color!) ? undefined : new vscode.ThemeColor('terminal.ansi' + rule.color),
					fontWeight: typeof rule.bold !== 'boolean' ? undefined : rule.bold ? 'bold' : 'normal',
					fontStyle: typeof rule.italic !== 'boolean' ? undefined : rule.italic ? 'italic' : 'normal',
					textDecoration:
						rule.underline === true && rule.strikeThrough === true ? 'underline line-through'
						: rule.underline === true ? 'underline'
						: rule.strikeThrough === true ? 'line-through'
						: rule.underline === false || rule.strikeThrough === false ? 'none'
						: undefined,
				})));
	}

	function updateDecorations(): void {
		if (allDecorationTypes.flat().length === 0) { return; }
		if (todoEditors.length === 0) { return; }

		const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
		if (!Array.isArray(configurations)) { return; }

		todoEditors.forEach(todoEditor => {
			const applicableConfigurations = configurations.filter(configuration =>
				Array.isArray(configuration.paths) && configuration.paths.some(path => {
					if (typeof path !== 'string') { return false; }

					// Support matches by filenames and relative file paths.
					const pattern = path.includes('/') || path.includes('\\') ? path : '**/' + path;
					const options: MinimatchOptions = { nocase: process.platform === 'win32' };
					return minimatch(vscode.workspace.asRelativePath(todoEditor.document.fileName), pattern, options);
				}));

			if (applicableConfigurations.length === 0) { return; }

			applicableConfigurations.forEach(configuration =>
				Array.isArray(configuration.rules) && configuration.rules?.forEach(rule => {
					const ranges: vscode.Range[] = [];

					Array.isArray(rule.patterns) && rule.patterns.forEach(pattern => {
						if (typeof pattern !== 'string') { return; }

						let regExp: RegExp;
						try {
							regExp = new RegExp(pattern, rule.matchCase === true ? 'gu' : 'giu');
						} catch (e) {
							return; // Skip invalid regular expression patterns.
						}

						for (let line = 0; line < todoEditor.document.lineCount; line++) {
							for (const match of todoEditor.document.lineAt(line).text.matchAll(regExp)) {
								if (match.index === undefined || match[0].length === 0) { continue; }
								ranges.push(new vscode.Range(line, match.index, line, match.index + match[0].length));
							}
						}
					});

					// We used to have rule-to-decoration-type map for selecting the decoration-type based on the
					// rule, but if the extension is installed from the package, it was found that the object
					// representing the same rule changes as user switches between documents, so the rule-object
					// could not be used as the key for the map.
					const decorationType = allDecorationTypes[configurations.indexOf(configuration)][configuration.rules!.indexOf(rule)];
					todoEditor.setDecorations(decorationType, ranges);
				}));

			doneEditors.push(todoEditor);
		});

		todoEditors = [];
	}

	vscode.workspace.onDidChangeConfiguration(
		event => {
			if (event.affectsConfiguration('colorMyText.configurations')) {
				resetDecorations();
			}
		},
		null,
		context.subscriptions);

	vscode.window.onDidChangeVisibleTextEditors(
		visibleEditors => {
			todoEditors = visibleEditors.filter(visibleEditor => !doneEditors.includes(visibleEditor));
			doneEditors = doneEditors.filter(doneEditor => visibleEditors.includes(doneEditor));
		},
		null,
		context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(
		event => {
			vscode.window.visibleTextEditors.forEach(visibleEditor => {
				if (visibleEditor.document === event.document && !todoEditors.includes(visibleEditor)) {
					todoEditors.push(visibleEditor);
				}
			});

			doneEditors = doneEditors.filter(doneEditor => !todoEditors.includes(doneEditor));
		},
		null,
		context.subscriptions);

	resetDecorations();
	setInterval(updateDecorations, 500);
}
