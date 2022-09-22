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
	};

	enum Color {
		blue = 'blue',
		cyan = 'cyan',
		green = 'green',
		magenta = 'magenta',
		red = 'red',
		yellow = 'yellow',
	}

	const themeColors: Record<Color, vscode.ThemeColor> = {
		[Color.blue]: new vscode.ThemeColor('terminal.ansiBlue'),
		[Color.cyan]: new vscode.ThemeColor('terminal.ansiCyan'),
		[Color.green]: new vscode.ThemeColor('terminal.ansiGreen'),
		[Color.magenta]: new vscode.ThemeColor('terminal.ansiMagenta'),
		[Color.red]: new vscode.ThemeColor('terminal.ansiRed'),
		[Color.yellow]: new vscode.ThemeColor('terminal.ansiYellow'),
	};

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
					color: setting.color === undefined ? undefined : themeColors[setting.color],
					fontWeight: setting.bold === undefined ? undefined : setting.bold ? 'bold' : 'normal',
					fontStyle: setting.italic === undefined ? undefined : setting.italic ? 'italic' : 'normal',
					textDecoration: setting.underline === undefined ? undefined : setting.underline ? 'underline' : 'none',
				};

				decorationTypeMap.set(setting, vscode.window.createTextEditorDecorationType(renderOptions));
			}));
	}

	function updateDecorations(): void {
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
						const regExp = new RegExp(pattern, setting.matchCase ?'g' : 'gi');
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
