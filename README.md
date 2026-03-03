# Color My Text

Color My Text lets you define text decoration rules for files that do not use a standard syntax, such as log files or to-do lists. Store the rules as workspace settings to share them with others who work on the same files.

Check out the extension on [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=JatinSanghvi.color-my-text).

To see it in action, clone [this repository](https://github.com/JatinSanghvi/color-my-text-vscode) and open the `example` folder in Visual Studio Code. Install the 'Color My Text' extension when prompted.

## Features

### Live Text Decorations

![live-color](/images/live-color.gif)

![live-style](/images/live-style.gif)

Decorations apply as you type and update instantly when you change rules. You do not need to reopen files. Decorations work across multiple editor windows.

**Tip:** Open the file to decorate on one side and the settings file on the other. Changes appear live, so you can quickly test patterns and try different styles.

![quick-configuration](/images/quick-configuration.gif)

### Configuration

#### Setting Structure

![workspace-setting](/images/setting.png)

#### `paths`

List of file path patterns that this configuration applies to.

- Supports most [glob-style](https://github.com/isaacs/node-glob#glob-primer) patterns (same as `.gitignore`).
- Accepts absolute paths or paths relative to the workspace folder.
- Use forward slashes as path separators on all platforms.
- Avoid absolute paths in workspace settings files, since different users may have different folder structures.

#### `rules`

List of decoration rules to apply to the matched files.

#### `patterns`

List of regular expression patterns. Text matching any pattern gets the rule applied.

- Patterns support [Unicode regular expressions](https://www.regular-expressions.info/unicode.html).
- These are not wildcard patterns. Use `Create\\w*Async` instead of `Create*Async`.

#### `matchCase`

Set to `true` for case-sensitive matching. Default is case-insensitive.

#### `multiLine`

Set to `true` to allow patterns to match text across multiple lines. When enabled, `.` also matches newline characters. Default is `false` (single-line matching only).

#### Colors and Styles

![theme-support](/images/theme-support.gif)

#### `color`

Accepts one of sixteen ANSI color names or a custom hex color code.

ANSI color names: `Black`, `Blue`, `BrightBlack`, `BrightBlue`, `BrightCyan`, `BrightGreen`, `BrightMagenta`, `BrightRed`, `BrightWhite`, `BrightYellow`, `Cyan`, `Green`, `Magenta`, `Red`, `White`, `Yellow`.

ANSI colors adapt to the active color theme, ensuring good contrast regardless of the theme. Custom hex colors in `#RGB`, `#RRGGBB`, or `#RRGGBBAA` format are fixed and do not adapt to the theme.

#### `bold`

`true` to bold, `false` to remove bold. Omit to keep original font weight.

#### `italic`

`true` to italicize, `false` to remove italic. Omit to keep original font style.

#### `underline`

`true` to add underline, `false` to remove underline. Omit to keep original decoration.

#### `strikeThrough`

`true` to add strikethrough, `false` to remove strikethrough. Omit to keep original decoration.

#### Notes

- Each rule must specify at least one decoration property.
- Decorations apply on top of the existing color theme. A rule that only sets `italic: true` will italicize text without changing its theme color.
- A file can match multiple configurations. All matching configurations apply.
- If text matches multiple rules, all decorations merge. For conflicting properties (such as `color`), the first matching rule wins.

    ```json
    "rules": [
        { "patterns": ["brown fox jumps"], "bold": true },
        { "patterns": ["fox jumps over"], "strikeThrough": true },
        { "patterns": ["jumps over the"], "italic": true }
    ]
    ```

    The text above produces: <pre>The quick <b>brown <strike>fox <i>jumps</b> over</strike> the</i> lazy dog.</pre>

### Share Decorations

![share-decorations](/images/share-decorations.gif)

Store decoration rules in the workspace settings file (`.vscode/settings.json`) alongside your files. When you share the files through a version control system, others can use and contribute to the decoration rules.

## Known Issues

These are minor issues caused by platform limitations.

- **Minimap:** Decorated text does not appear with its decoration colors in the minimap. This is a VS Code limitation.

- **Underline and strikethrough conflict:** If text matches two rules where one sets `underline` and the other sets `strikeThrough`, only the first rule applies. This is a CSS limitation.

- **JSON schema validation error:** While adding configuration, VS Code may show `Missing Property "color".` before you add any decoration property. Ignore it. The error disappears once you add any property.
