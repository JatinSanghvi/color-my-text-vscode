import * as vscode from 'vscode';
import * as minimatch from 'minimatch';
import { Configuration, Setting } from './configuration';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "color-my-text" is activated.');

	let todoEditors: vscode.TextEditor[];
	let doneEditors: vscode.TextEditor[];
	let decorationTypeMap: Map<Setting, vscode.TextEditorDecorationType> = new Map();

	function resetDecorations(): void {
		todoEditors = vscode.window.visibleTextEditors.slice();
		doneEditors = [];

		// Clear all applied decorations.
		todoEditors.forEach(todoEditor =>
			decorationTypeMap.forEach(decorationType =>
				todoEditor.setDecorations(decorationType, [])));

		decorationTypeMap = new Map();
		const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
		configurations?.forEach(configuration =>
			configuration.settings?.forEach(setting =>
				decorationTypeMap.set(
					setting,
					vscode.window.createTextEditorDecorationType({
						color: new vscode.ThemeColor('terminal.ansiRed'),
					}))));
	}

	function updateDecorations(): void {
		if (todoEditors.length === 0) { return; }

		const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
		if (configurations === undefined) { return; }

		todoEditors.forEach(todoEditor => {
			const applicableConfigurations = configurations.filter(configuration =>
				configuration.fileSelectors?.some(selector => {
					const pathPattern = selector.includes('/') ? selector : '**/' + selector;
					return minimatch(vscode.workspace.asRelativePath(todoEditor.document.fileName), pathPattern);
				}));

			if (applicableConfigurations.length === 0) { return; }

			const text = todoEditor.document.getText();

			applicableConfigurations.forEach(configuration =>
				configuration.settings?.forEach(setting => {
					const ranges: vscode.Range[] = [];

					setting.patterns?.forEach(pattern => {
						const regExp = new RegExp(pattern, 'g');
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
