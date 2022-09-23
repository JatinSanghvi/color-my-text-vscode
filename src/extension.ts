import * as vscode from 'vscode';
import * as minimatch from 'minimatch';

export function activate(context: vscode.ExtensionContext): void {
	console.log('Extension "color-my-text" is activated.');

	type Configuration = {
		fileSelectors?: string[],
		settings?: Setting[],
	};

	type Setting = {
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
	let decorationTypeMap: Map<Setting, vscode.TextEditorDecorationType> = new Map();

	function resetDecorations(): void {
		todoEditors = vscode.window.visibleTextEditors.slice();
		doneEditors = [];

		// Clear all decorations.
		todoEditors.forEach(todoEditor =>
			decorationTypeMap.forEach(decorationType =>
				todoEditor.setDecorations(decorationType, [])));

		// Refresh decoration-type map.
		decorationTypeMap = new Map();
		const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
		configurations?.forEach(configuration =>
			configuration.settings?.forEach(setting => {

				const renderOptions: vscode.DecorationRenderOptions = {
					color: !Object.values(Color).includes(setting.color!) ? undefined : new vscode.ThemeColor('terminal.ansi' + setting.color),
					fontWeight: setting.bold === undefined ? undefined : setting.bold ? 'bold' : 'normal',
					fontStyle: setting.italic === undefined ? undefined : setting.italic ? 'italic' : 'normal',
					textDecoration:
						setting.underline === true && setting.strikeThrough === true ? 'underline line-through'
						: setting.underline === true ? 'underline'
						: setting.strikeThrough === true ? 'line-through'
						: setting.underline === false || setting.strikeThrough === false ? 'none'
						: undefined,
				};

				decorationTypeMap.set(setting, vscode.window.createTextEditorDecorationType(renderOptions));
			}));
	}

	function updateDecorations(): void {
		if (decorationTypeMap.size === 0) { return; }
		if (todoEditors.length === 0) { return; }

		const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
		if (configurations === undefined) { return; }

		todoEditors.forEach(todoEditor => {
			const applicableConfigurations = configurations.filter(configuration =>
				configuration.fileSelectors?.some(selector => {

					// Support matches by filenames and relative file paths.
					const pathPattern = selector.includes('/') ? selector : '**/' + selector;
					return minimatch(vscode.workspace.asRelativePath(todoEditor.document.fileName), pathPattern);
				}));

			if (applicableConfigurations.length === 0) { return; }

			const text = todoEditor.document.getText();

			applicableConfigurations.forEach(configuration =>
				configuration.settings?.forEach(setting => {
					const ranges: vscode.Range[] = [];

					setting.patterns?.forEach(pattern => {
						const regExp = new RegExp(pattern, setting.matchCase ? 'g' : 'gi');
						let match: RegExpExecArray | null;

						while (match = regExp.exec(text)) {
							const startPosition = todoEditor.document.positionAt(match.index);
							const endPosition = todoEditor.document.positionAt(match.index + match[0].length);
							ranges.push(new vscode.Range(startPosition, endPosition));
						}
					});

					if (ranges.length !== 0) {
						todoEditor.setDecorations(decorationTypeMap.get(setting)!, ranges);
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
