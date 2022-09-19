import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "color-my-text" is activated.');

	const decorationType = vscode.window.createTextEditorDecorationType({
		color: new vscode.ThemeColor('terminal.ansiRed'),
	});

	const regExp = /Jatin/g;

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		const text = activeEditor.document.getText();
		const ranges: vscode.Range[] = [];

		let match: RegExpExecArray | null;
		while (match = regExp.exec(text)) {
			const startPosition = activeEditor.document.positionAt(match.index);
			const endPosition = activeEditor.document.positionAt(match.index + match[0].length);
			ranges.push(new vscode.Range(startPosition, endPosition));
		}

		activeEditor.setDecorations(decorationType, ranges);
	}

	let timeout: NodeJS.Timer | undefined = undefined;

	function triggerUpdateDecorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}

		if (throttle) {
			timeout = setTimeout(updateDecorations, 500);
		} else {
			updateDecorations();
		}
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	// Register event listeners.
	vscode.window.onDidChangeActiveTextEditor(
		editor => {
			activeEditor = editor;
			if (editor) {
				triggerUpdateDecorations();
			}
		},
		null,
		context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(
		event => {
			if (activeEditor && event.document === activeEditor.document) {
				triggerUpdateDecorations(true);
			}
		},
		null,
		context.subscriptions);
}
