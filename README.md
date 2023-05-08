# Color My Text

![color-my-text](/images/hero.png)

## Introduction

The **Color My Text** extension enables you to add custom text-decoration rules to files that do not conform to a standard syntax, such as log files or personal to-do lists. These decoration rules can be stored as workspace settings, so they can be shared with others who work on the same files. This means that when you share files in non-standard formats with other users, you can now also supplement those files with information on how they should be decorated. Isn't that amazing?

Still confused? Clone [this repository](https://github.com/JatinSanghvi/color-my-text-vscode) and open the `example` folder inside Visual Studio Code. Make sure that you install the 'Color My Text' extension which should be recommended to you after the folder is opened.

Check out the extension on [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=JatinSanghvi.color-my-text).

## Features

### Apply Text Decorations as You Type

![live-color](/images/live-color.gif)

![live-style](/images/live-style.gif)

The text decorations get applied as you type in the files and also as you update the decoration rules in the settings file. There is no need to reopen the files to reapply the text decorations. It does not matter if the document is split over multiple windows. It just works.

When you are creating text decoration rules, I would suggest having the file to be decorated opened on one side of the editor and the settings file opened on the other side. This way, as you change the configuration, you can see them being applied live on the file. This can help you quickly find issues with the regex patterns and experiment with different styles so as to choose one that offers you the best appearance.

![quick-configuration](/images/quick-configuration.gif)

### Fully Configurable

#### Anatomy of Workspace Setting

![workspace-setting](/images/setting.png)

#### Specify files, file types, folders, or any combination of them

You can specify multiple paths with `paths` property to apply a common set of rules on all of them. In the example setting above, the lines ending with `- done` will be struck out in all the Markdown files and all files named `todo.txt` inside `todos` folder or its subfolders.

- Most of the [glob-style](https://github.com/isaacs/node-glob#glob-primer) patterns are supported, as you may have used them in the `.gitignore` file.

- The path patterns can either contain absolute paths or paths relative to the workspace folder.

- The paths should use forward-slashes as path-delimiters irrespective of the host operating system.

- Do not put absolute paths if you are storing the configuration inside the workspace settings file. Absolute paths only make sense inside the user settings file as different users can have different folder structures.

#### Specify list of rules for each set of files

You can specify multiple rules with `rules` property for each set of paths. In the example setting above, the lines ending with `- doing` will be set to bold and underlined, and the lines ending with `- todo` will be italicized for the log files inside `C:\Log Files` folder.

#### Specify list of regular expression patterns to match the text

You can specify multiple regular expression patterns with `patterns` property for each rule. Text matching any of the regular expressions will have that rule applied. These patterns can also contain [Unicode regular expressions](www.regular-expressions.info/unicode.html) tokens. In the example setting above, both words `Critical` and `Error` will be colored with bright red color. _Note that these are not wildcard patterns, so a pattern such as `"Create*Async"` will not work as expected. Instead, you may want to set the pattern as `"Create\\w*Async"`._

#### Specify whether to perform case-sensitive matches

You can specify whether to perform case-sensitive matches of text with the regular expressions with the `matchCase` property. If the property is not specified, the extension will perform case-insensitive matches. In the example setting above, all rules for paths `*.md` and `todos/**/todo.txt` will be applied case-insensitively while the rules for path `C:\Log Files\*.log` will be applied case-sensitively.

### Numerous Color and Style Combinations

![theme-support](/images/theme-support.gif)

You can set any of the color and style combinations for each of the rules.

#### `color`

You can choose one of the sixteen colors as listed in the [Integrated Terminal colors](https://code.visualstudio.com/api/references/theme-color#integrated-terminal-colors) section with the `terminal.ansi` prefix removed. These colors are `Black`, `Blue`, `BrightBlack`, `BrightBlue`, `BrightCyan`, `BrightGreen`, `BrightMagenta`, `BrightRed`, `BrightWhite`, `BrightYellow`, `Cyan`, `Green`, `Magenta`, `Red`, `White`, and `Yellow`.

By providing a limited set of color options, we can ensure the colored text will mix well with the rest of the text irrespective of the color theme selected by the user. Most of the standard Visual Studio Code color themes will choose the colors for the text that will contrast well with the editor background. And it prevents you from fixing all colors in the settings if you ever want to switch between Light and Dark colored themes. It also removes the requirement for two users sharing the configuration to have the same color theme set in their respective editors. In short, the text colors will update themselves automatically to match with the color themes.

#### `bold`

You can set the value of this property to `true` to **bold** the text, to `false` to un-bold the text (if the color theme had bolded it), or do not set it to retain the original font weight.

#### `italic`

You can set the value of this property to `true` to _italicize_ the text, to `false` to un-italicize the text (if the color theme had italicized it), or do not set it to retain the original font style.

#### `underline`

You can set the value of this property to `true` to <u>underline</u> the text, to `false` to un-underline the text (if the color theme had underlined it), or do not set it to retain the original text decoration.

#### `strikeThrough`

You can set the value of this property to `true` to ~~strike out~~ the text, to `false` to un-strike the text (if the color theme had struck it), or do not set it to retain the original text decoration.

#### Useful Information

- All the above text decoration properties are optional, but you should specify at least one property under each rule.

- Your text-decorations will be applied on top of the existing color theme as set by the user. So, for instance, if some text is already colored by virtue of the color theme, if your rule does not specify the value of `color` property but has value of property `italic` set to `true`, the text color will stay same as dictated by the color theme, but the text will get italicized in addition.

- It is possible that the document that is opened matches path patterns across multiple configurations. In that case, all the configurations will apply. For example, if you have one set of rules for path pattern `*` and another set of rules for path pattern `*.md`, then your Markdown file will have both sets of rules applied.

- Similarly, if your text matches multiple rules with different sets of text-decorations, a merged text-decoration based on all those qualified rules will get applied to the text. As an example, say if your configuration looks like below:

    ```json
    "rules": [
        { "patterns": ["brown fox jumps"], "bold": true },
        { "patterns": ["fox jumps over"], "strikeThrough": true }
        { "patterns": ["jumps over the"], "italic": true },
    ]
    ```

    Then, your text will look like:

    <pre>The quick <b>brown <strike>fox <i>jumps</b> over</strike> the</i> lazy dog.</pre>

- If the same text matches multiple conflicting rules, such as if the value of property `color` is set to different values inside different rules, then the very first rule in the sequence will win and will be applied to the matching text.

### Share and Collaborate Over Text Decorations

![share-decorations](/images/share-decorations.gif)

As I mentioned earlier, the text decoration rules can be shared through the workspace settings file (`.vscode/settings.json`) along with the files on which those rules will need to be applied. Hence, when you share your files with other users via a version control system, then just like you can accept contributions for the regular files, you can also accept fixes and enhancements to the decoration rules from other users.

## Known Issues

All the below are minor issues and in most cases, should not affect your experience. These are all results of various platform limitations.

- Text decorations do not show in the minimap. As an example, if you color all lines in a log file with text `Failed` with red color, you will not be able to see those red lines in the minimap. You will need to scroll through the document to find them. This is how the Visual Studio Code behaves. They must have excluded minimap from being decorated for performance reasons.

- If the text matches multiple rules, one of them has property `underline` set to either `true` or `false` and the other one has `strikeThrough` set to either `true` or `false`, only the first rule (i.e., either underline or strike-through) in the sequence of configurations will get applied. This is how CSS works and making the behavior any different would have created further confusion when both of these decorations together are applied on top of the text rendered by the color theme. Anyway, why would you ever want to underline and strike out the text at the same time? :)

- While adding the configuration inside user or workspace settings, before you add any of the text decoration properties, Visual Studio Code would show JSON schema validation error `Missing Property "color".` This is because it is not able to correctly handle some of the advanced JSON schema attributes. This is possibly a design choice than a bug. Just ignore the message. Once you add any property (e.g., `bold`), the schema validation error will correctly disappear.

- It was thought to add support for having one pattern for matching the text, and another pattern for applying the decorations. For example, if someone sets the text pattern with a capture-group such as `(\\w+) - done`, just the text matching the capture group i.e., `Shopping` out of `Shopping - done` would be decorated. However, as per the TypeScript type definitions, the current version of Node.js that is used within Visual Studio Code does not support locating the indices of each capture group.

    **Update**:  The cell for `hasIndices` flag inside [Browser compatibility chart](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) used to show a cross earlier. As of May 2023, Node.js seems to have included support for `hasIndices` flag. However, I have decided to postpone the implementation of this feature for now. Please find an explanation behind the decision under the [Difficult Choices](#difficult-choices) section.

## Difficult Choices

Following are some of the choices that I could not make up my mind on. I may reconsider them in future based on user feedback.

### Supporting Decoration of Capture Groups

It would be interesting to support decorations for capture groups within a regular expression. This allows more flexibility in terms of what text gets decorated. For example, if you have some text that looks like `Seattle - Washington - USA` and you want to color individual items differently, then a way to do it would be to specify regex pattern as `(\\w+) - (\\w+) - (\\w+)` with three capture groups and provide separate coloring rules for text matching the individual capture groups. In its current state, if we need to achieve the same results, we need to specify three rules with positive lookahead and lookbehind assertions in the pattern such as `\\w+(?= - \\w+ - \\w+)` to match `Seattle`, `(?<=\\w+ - )\\w+(?= - \\w+)` to match `Washington` and `(?<=\\w+ - \\w+ - )\\w+` to match `USA`. This is not only cumbersome but also not very intuitive.

However, after more contemplation, I decided not to implement this feature, the reasons being:

- The configuration JSON schema will get further complicated as users will need to provide an array of decorations under each rule.
- The support for multiple patterns in a rule might need to be dropped to avoid confusing conditions such as having two patterns with different number of capture groups.
- Some of the rules may require decorating the text matching the entire pattern while others may require decorating text matching the capture groups. This will require adding support for both kinds of use cases.
- This will most likely require introducing a breaking change to the configuration with no trivial migration path for existing users.

### Decorating Visible Text Only

The existing implementation decorates the entire file content. This process consumes significant processor time and becomes visibly slow when user is editing  a large text file. I need to check if it is possible to find just the lines that were edited since the last time and decorate only those ones. Another possible optimization would be to only decorate the text that is visible in the document window. However, in this case, when user would scroll through the document, the text would first appear undecorated and then get decorated after a short delay, which might degrade the user experience. Yet another potential solution would be to decorate the visible text first and the invisible text later (with a larger interval between successive decorations). Again, I can compare these options and choose to work on them based on user feedback.

## Meta Section

### Background

This extension was developed as part of [Microsoft Hackathon 2022](https://news.microsoft.com/life/hackathon/) project. A week before the Hackathon week, I was looking to color lines where shared variables are accessed inside a C# file to visibly ensure there are no concurrency issues present inside the code. I could not find a great extension that fulfilled my requirements, hence I decided to build an extension by myself. I hope more similar use cases will be uncovered with this extension and it will serve many people and teams.

### Non-Goals

Some of these non-goals were set considering my little experience working on JavaScript and TypeScript, and the short time I had to work on the extension. But now the project is nearing completion, I think all of these were the right choices. I do not intend to convert any of these non-goals into goals at the time of this writing.

- Adding support for hierarchical configuration similar to `.editorconfig` file.
- Adding support for wildcard text patterns such as `a??le` or `a*le` for matching the word `apple`, or a simple plain text search like `apples[0]`.
- Adding support to 'Match Whole Word'. Regex patterns should be sufficient to meet this requirement.
- Providing functionality through commands and with keyboard shortcuts.
- Adding GUI experience. I believe that all able developers would prefer setting file over UI.
- Decomposing functionality into several TypeScript classes and/or modules.
- Writing unit and integration tests.
- Giving special treatment to the setting file. For example, coloring the JSON-text for each rule with the decoration mentioned in that rule.
