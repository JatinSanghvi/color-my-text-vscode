import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "color-my-text" is activated.');

	const decorationType = vscode.window.createTextEditorDecorationType({
		color: new vscode.ThemeColor('terminal.ansiRed'),
	});

	let doneEditors: vscode.TextEditor[] = [];
	let todoEditors: vscode.TextEditor[] = vscode.window.visibleTextEditors.slice();

	const regExp = /Jatin/g;

	function updateDecorations() {
		todoEditors.forEach(todoEditor => {
			const text = todoEditor.document.getText();
			let match: RegExpExecArray | null;
			const ranges: vscode.Range[] = [];

			while (match = regExp.exec(text)) {
				const startPosition = todoEditor.document.positionAt(match.index);
				const endPosition = todoEditor.document.positionAt(match.index + match[0].length);
				ranges.push(new vscode.Range(startPosition, endPosition));
			}

			console.log("Decorate:", todoEditor.document.fileName);
			todoEditor.setDecorations(decorationType, ranges);
			doneEditors.push(todoEditor);
		});

		todoEditors = [];
	}

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

	setInterval(updateDecorations, 500);
}
