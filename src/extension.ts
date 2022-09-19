import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "color-my-text" is activated.');

	let disposable = vscode.commands.registerCommand('color-my-text.helloWorld', () => {

		const decorationType = vscode.window.createTextEditorDecorationType({
			color: new vscode.ThemeColor('terminal.ansiRed'),
		});

		const regExp: RegExp = /Jatin/g;

		vscode.window.visibleTextEditors.forEach(editor => {
			const text: string = editor.document.getText();
			const ranges: vscode.Range[] = [];

			let match: RegExpExecArray | null;
			while (match = regExp.exec(text)) {
				const start = editor.document.positionAt(match.index);
				const end = editor.document.positionAt(match.index + match[0].length);
				ranges.push(new vscode.Range(start, end));
			}

			editor.setDecorations(decorationType, ranges);
		});
	});

	context.subscriptions.push(disposable);
}
