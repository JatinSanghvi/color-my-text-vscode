import * as vscode from 'vscode';
import { minimatch } from 'minimatch';

type Configuration = {
    paths?: string[];
    rules?: Rule[];
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

// Precomputed data for a single rule.
type RuleData = {
    decorationType: vscode.TextEditorDecorationType;
    regexes: RegExp[];
};

// Precomputed data for a single configuration entry, rebuilt whenever settings change.
type ConfigData = {
    globs: string[];
    ruleData: RuleData[];
};

function toArray<T>(value: T[] | undefined): T[] {
    return Array.isArray(value) ? value : [];
}

// ANSI color names map to VS Code terminal theme tokens ('terminal.ansi<Name>').
const ansiColorNames = new Set<string>([
    'Black', 'Blue', 'BrightBlack', 'BrightBlue', 'BrightCyan', 'BrightGreen',
    'BrightMagenta', 'BrightRed', 'BrightWhite', 'BrightYellow',
    'Cyan', 'Green', 'Magenta', 'Red', 'White', 'Yellow',
]);

function buildRuleData(rule: Rule): RuleData {
    const color = typeof rule.color !== 'string' ? undefined
        : ansiColorNames.has(rule.color) ? new vscode.ThemeColor('terminal.ansi' + rule.color)
        : rule.color;

    // 'none' explicitly removes any theme-inherited decoration when either flag is false.
    const textDecoration =
        rule.underline === true && rule.strikeThrough === true ? 'underline line-through'
        : rule.underline === true ? 'underline'
        : rule.strikeThrough === true ? 'line-through'
        : rule.underline === false || rule.strikeThrough === false ? 'none'
        : undefined;

    const decorationType = vscode.window.createTextEditorDecorationType({
        color,
        fontWeight: typeof rule.bold !== 'boolean' ? undefined : rule.bold ? 'bold' : 'normal',
        fontStyle: typeof rule.italic !== 'boolean' ? undefined : rule.italic ? 'italic' : 'normal',
        textDecoration,
    });

    const regexes = toArray(rule.patterns).flatMap(pattern => {
        try {
            return [new RegExp(pattern, rule.matchCase === true ? 'gu' : 'giu')];
        } catch {
            return []; // Skip invalid regex patterns.
        }
    });

    return { decorationType, regexes };
}

export function activate(context: vscode.ExtensionContext): void {
    console.log('Extension "color-my-text" is activated.');

    let allConfigData: ConfigData[] = [];

    // todoEditors need (re)decoration; doneEditors are already up to date.
    // Tracking both avoids re-decorating unchanged editors when unrelated ones become visible.
    let todoEditors: vscode.TextEditor[] = [];
    let doneEditors: vscode.TextEditor[] = [];

    // Disposes old decoration types and rebuilds allConfigData from current settings.
    function resetDecorations(): void {
        todoEditors = vscode.window.visibleTextEditors.slice();
        doneEditors = [];

        allConfigData.forEach(configData => configData.ruleData.forEach(ruleData => ruleData.decorationType.dispose()));

        const configurations = vscode.workspace.getConfiguration('colorMyText').get<Configuration[]>('configurations');
        allConfigData = toArray(configurations).map(configuration => ({
            globs: toArray(configuration.paths),
            ruleData: toArray(configuration.rules).map(buildRuleData),
        }));
    }

    // Applies decorations to all queued editors. Runs on a 500ms timer to batch rapid edits.
    function updateDecorations(): void {
        if (allConfigData.every(configData => configData.ruleData.length === 0)) { return; }
        if (todoEditors.length === 0) { return; }

        todoEditors.forEach(editor => {
            const filePath = vscode.workspace.asRelativePath(editor.document.fileName);

            // Collect rule data from all configurations whose path globs match this editor's file.
            const matchingRuleData = allConfigData.flatMap(configData =>
                configData.globs.some(glob => {
                    // A bare filename (no path separators) is matched against any directory level.
                    const pattern = glob.includes('/') || glob.includes('\\') ? glob : '**/' + glob;
                    return minimatch(filePath, pattern, { nocase: process.platform === 'win32' });
                }) ? configData.ruleData : []);

            if (matchingRuleData.length === 0) { return; }

            matchingRuleData.forEach(({ decorationType, regexes }) => {
                const ranges: vscode.Range[] = [];

                for (const regex of regexes) {
                    for (let lineNum = 0; lineNum < editor.document.lineCount; lineNum++) {
                        for (const match of editor.document.lineAt(lineNum).text.matchAll(regex)) {
                            if (match.index === undefined || match[0].length === 0) { continue; }
                            ranges.push(new vscode.Range(lineNum, match.index, lineNum, match.index + match[0].length));
                        }
                    }
                }

                editor.setDecorations(decorationType, ranges);
            });

            doneEditors.push(editor);
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
            // Queue newly visible editors; prune editors that were closed.
            todoEditors = visibleEditors.filter(editor => !doneEditors.includes(editor));
            doneEditors = doneEditors.filter(editor => visibleEditors.includes(editor));
            updateDecorations();
        },
        null,
        context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(
        event => {
            // Re-queue any visible editor showing the changed document.
            vscode.window.visibleTextEditors.forEach(visibleEditor => {
                if (visibleEditor.document === event.document && !todoEditors.includes(visibleEditor)) {
                    todoEditors.push(visibleEditor);
                }
            });

            doneEditors = doneEditors.filter(editor => !todoEditors.includes(editor));
        },
        null,
        context.subscriptions);

    resetDecorations();
    const intervalId = setInterval(updateDecorations, 500);
    context.subscriptions.push({ dispose: () => clearInterval(intervalId) });
}
