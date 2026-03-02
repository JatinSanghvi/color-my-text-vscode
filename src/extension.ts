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
        color?: string;
        matchCase?: boolean;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikeThrough?: boolean;
    };

    function toArray<T>(value: T[] | undefined): T[] {
        return Array.isArray(value) ? value : [];
    }

    const ansiColorValues = new Set<string>([
        'Black', 'Blue', 'BrightBlack', 'BrightBlue', 'BrightCyan', 'BrightGreen',
        'BrightMagenta', 'BrightRed', 'BrightWhite', 'BrightYellow',
        'Cyan', 'Green', 'Magenta', 'Red', 'White', 'Yellow',
    ]);
    const minimatchOptions: MinimatchOptions = { nocase: process.platform === 'win32' };

    let todoEditors: vscode.TextEditor[];
    let doneEditors: vscode.TextEditor[];
    let allDecorationTypes: vscode.TextEditorDecorationType[][] = [];
    let allCompiledPatterns: RegExp[][][] = [];

    function resetDecorations(): void {
        todoEditors = vscode.window.visibleTextEditors.slice();
        doneEditors = [];

        // Clear all decorations.
        todoEditors.forEach(todoEditor =>
            allDecorationTypes.forEach(types =>
                types.forEach(decorationType =>
                    todoEditor.setDecorations(decorationType, []))));

        // Refresh decoration-type and compiled-pattern maps.
        const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
        allDecorationTypes = toArray(configurations).map(configuration =>
            toArray(configuration.rules).map(rule =>
                vscode.window.createTextEditorDecorationType({
                    color: typeof rule.color !== 'string' ? undefined
                        : ansiColorValues.has(rule.color) ? new vscode.ThemeColor('terminal.ansi' + rule.color)
                        : rule.color,
                    fontWeight: typeof rule.bold !== 'boolean' ? undefined : rule.bold ? 'bold' : 'normal',
                    fontStyle: typeof rule.italic !== 'boolean' ? undefined : rule.italic ? 'italic' : 'normal',
                    textDecoration:
                        rule.underline === true && rule.strikeThrough === true ? 'underline line-through'
                        : rule.underline === true ? 'underline'
                        : rule.strikeThrough === true ? 'line-through'
                        : rule.underline === false || rule.strikeThrough === false ? 'none'
                        : undefined,
                })));

        allCompiledPatterns = toArray(configurations).map(configuration =>
            toArray(configuration.rules).map(rule =>
                toArray(rule.patterns).flatMap(pattern => {
                    try {
                        return [new RegExp(pattern, rule.matchCase === true ? 'gu' : 'giu')];
                    } catch (e) {
                        return []; // Skip invalid regular expression patterns.
                    }
                })));
    }

    function updateDecorations(): void {
        if (allDecorationTypes.every(types => types.length === 0)) { return; }
        if (todoEditors.length === 0) { return; }

        const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
        if (!Array.isArray(configurations)) { return; }

        todoEditors.forEach(todoEditor => {
            const relPath = vscode.workspace.asRelativePath(todoEditor.document.fileName);

            const applicableConfigurations = configurations.flatMap((configuration, ci) =>
                toArray(configuration.paths).some(path => {
                    // Support matches by filenames and relative file paths.
                    const pattern = path.includes('/') || path.includes('\\') ? path : '**/' + path;
                    return minimatch(relPath, pattern, minimatchOptions);
                }) ? [{ configuration, ci }] : []);

            if (applicableConfigurations.length === 0) { return; }

            applicableConfigurations.forEach(({ configuration, ci }) =>
                toArray(configuration.rules).forEach((rule, ri) => {
                    const ranges: vscode.Range[] = [];

                    for (const regExp of allCompiledPatterns[ci][ri]) {
                        for (let line = 0; line < todoEditor.document.lineCount; line++) {
                            for (const match of todoEditor.document.lineAt(line).text.matchAll(regExp)) {
                                if (match.index === undefined || match[0].length === 0) { continue; }
                                ranges.push(new vscode.Range(line, match.index, line, match.index + match[0].length));
                            }
                        }
                    }

                    // We used to have rule-to-decoration-type map for selecting the decoration-type based on the
                    // rule, but if the extension is installed from the package, it was found that the object
                    // representing the same rule changes as user switches between documents, so the rule-object
                    // could not be used as the key for the map.
                    todoEditor.setDecorations(allDecorationTypes[ci][ri], ranges);
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
    const intervalId = setInterval(updateDecorations, 500);
    context.subscriptions.push({ dispose: () => clearInterval(intervalId) });
}
