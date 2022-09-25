import * as vscode from 'vscode';
import * as minimatch from 'minimatch';

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
		allDecorationTypes = configurations === undefined
			? []
			: configurations.map(configuration => configuration.rules === undefined
				? []
				: configuration.rules.map(rule =>
					vscode.window.createTextEditorDecorationType({
					color: !Object.values(Color).includes(rule.color!) ? undefined : new vscode.ThemeColor('terminal.ansi' + rule.color),
					fontWeight: rule.bold === undefined ? undefined : rule.bold ? 'bold' : 'normal',
					fontStyle: rule.italic === undefined ? undefined : rule.italic ? 'italic' : 'normal',
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
		if (configurations === undefined) { return; }

		todoEditors.forEach(todoEditor => {
			const applicableConfigurations = configurations.filter(configuration =>
				configuration.paths?.some(path => {
					// Support matches by filenames and relative file paths.
					const pattern = path.includes('/') || path.includes('\\') ? path : '**/' + path;
					const options: minimatch.IOptions = { nocase: process.platform === 'win32' };
					return minimatch(vscode.workspace.asRelativePath(todoEditor.document.fileName), pattern, options);
				}));

			if (applicableConfigurations.length === 0) { return; }

			const text = todoEditor.document.getText();

			applicableConfigurations.forEach(configuration =>
				configuration.rules?.forEach(rule => {
					const ranges: vscode.Range[] = [];

					rule.patterns?.forEach(pattern => {
						const regExp = new RegExp(pattern, rule.matchCase ? 'g' : 'gi');

						for (const match of text.matchAll(regExp)) {
							if (match.index === undefined || match[0].length === 0) { continue; }
							const startPosition = todoEditor.document.positionAt(match.index);
							const endPosition = todoEditor.document.positionAt(match.index + match[0].length);
							ranges.push(new vscode.Range(startPosition, endPosition));
						}
					});

					if (ranges.length !== 0) {
						// We used to have rule-to-decoration-type map for selecting the decoration-type based on the
						// rule, but if the extension is installed from the package, it was found that the object
						// representing the same rule changes as user switches between documents, so the rule-object
						// could not be used as the key for the map.
						const decorationType = allDecorationTypes[configurations.indexOf(configuration)][configuration.rules!.indexOf(rule)];
						todoEditor.setDecorations(decorationType, ranges);
					}
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
