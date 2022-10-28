# Color My Text

![color-my-text](/images/hero.png)

## Introduction

**Color My Text** extension enables you to configure custom text-decoration rules for files, such as log files or personal to-do lists, which do not adhere to any well-known syntax. Since the decoration rules are stored in the workspace settings, they can be shared along with the rest of the files to be decorated. Hence, you can imagine that when you are sharing files of custom formats with other users, you are also supplementing those files with information on how those should be decorated. Isn't that amazing?

Still confused? Clone [this repository](https://github.com/JatinSanghvi/color-my-text-vscode) and open the `example` folder inside Visual Studio Code. Make sure that you install the 'Color My Text' extension which should be recommended to you after the folder is opened.

Check out the extension on [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=JatinSanghvi.color-my-text).

## Features

### Apply Text Decorations as You Type

![live-color](/images/live-color.gif)

![live-style](/images/live-style.gif)

All text decorations will be applied as you type. There is no need to reopen the documents to reapply text decorations. It does not matter if the document is split over multiple windows. It just works.

For creating your text decoration rules, I would suggest having the file to be decorated opened on one side of the editor and the setting file opened on the other side. This way you can see the configuration applied live on the file as you change them. This can help you quickly find issues and experiment with different styles to devise a set of rules that offers you the best appearance.

![quick-configuration](/images/quick-configuration.gif)

### Fully Configurable

#### Anatomy of Workspace Setting

![workspace-setting](/images/setting.png)

#### Specify files, file types, folders, or any combination of them

You can specify multiple paths with `paths` property to apply a common set of rules on all of them. In the example setting above, the lines ending with `- done` will be struck out in all of the Markdown files and all files named `todo.txt` inside folder `todos` or one of its subfolders.

- Most of the [glob-style](https://github.com/isaacs/node-glob#glob-primer) patterns as you may have used in `.gitignore` file are supported.

- The path patterns can either be absolute paths or relative to the workspace folder path.

- All paths should be delimited by forward-slashes irrespective of the host operating system.

- It does not make sense to use absolute paths in workspace settings. You may want to store such configurations inside the user settings for your personal use.

#### Specify list of rules for each set of files

You can specify multiple rules with `rules` property for each set of paths. In the example setting above, the lines ending with `- doing` will be set to bold and underlined, and the lines ending with `- todo` will be italicized for the log files inside folder `C:\Log Files`.

#### Specify list of regular expression patterns to match the text

You can specify multiple regular expression patterns with `patterns` property for each rule. Text matching any of the regular expressions will have that rule applied. In the example setting above, both words `Critical` and `Error` will be colored with bright red color. _Note that these are not wildcard patterns, so a pattern such as `"Create*Async"` will not work as expected. Instead, you would want to set the pattern as `"Create\\w*Async"`._

#### Specify whether to perform case-sensitive matches

You can specify whether to perform case-sensitive matches of text with the regular expressions with the `matchCase` property. If the property is not specified, the extension will perform case-insensitive matches. In the example setting above, all rules for paths `*.md` and `todos/**/todo.txt` will be applied case-insensitively while the rules for path `C:\Log Files\*.log` will be applied case-sensitively.

### Numerous Color and Style Combinations

![theme-support](/images/theme-support.gif)

You can set any of the color and style combinations for each of the rules.

#### `color`

You can choose one of the sixteen colors as listed in the [Integrated Terminal colors](https://code.visualstudio.com/api/references/theme-color#integrated-terminal-colors) section without `terminal.ansi` prefixed. These colors are `Black`, `Blue`, `BrightBlack`, `BrightBlue`, `BrightCyan`, `BrightGreen`, `BrightMagenta`, `BrightRed`, `BrightWhite`, `BrightYellow`, `Cyan`, `Green`, `Magenta`, `Red`, `White`, and `Yellow`.

By providing a limited set of color options, we can ensure the colored text will mix well with the rest of the text irrespective of the color theme selected by the user. Most of the standard Visual Studio Code color themes will choose the colors for the text that will contrast well with the editor background. And it prevents you from fixing all colors in the settings if you ever want to switch between Light and Dark colored themes. It also removes the requirement for two users sharing the rules to have the same color theme set in their respective editors. In short, the text colors will get updated automatically to match with the color themes.

#### `bold`

You can set the value of this property to `true` to **bold** the text, to `false` to un-bold the text (if the color theme had bolded it), or do not set it to retain the original font weight.

#### `italic`

You can set the value of this property to `true` to _italicize_ the text, to `false` to un-italicize the text (if the color theme had italicized it), or do not set it to retain the original font style.

#### `underline`

You can set the value of this property to `true` to <u>underline</u> the text, to `false` to un-underline the text (if the color theme had underlined it), or do not set it to retain the original text decoration.

#### `strikeThrough`

You can set the value of this property to `true` to ~~strike out~~ the text, to `false` to un-strike the text (if the color theme had struck it), or do not set it to retain the original text decoration.

#### Useful Information

- All the above text decoration properties are optional but you should specify at least one property under each rule.

- Your text-decorations will be applied on top of the existing color theme as set by the user. So, for instance, if some text is already colored by virtue of the color theme, if your rule does not specify the value of `color` property but has value of property `italic` set to `true`, the text color will stay same as dictated by the color theme but the text will get italicized in addition.

- It is possible that the document that is opened matches path patterns across multiple configurations. In that case, all of the configurations will apply. For example, if you have one set of rules for path pattern `*` and another set of rules for path pattern `*.md`, then your Markdown file will have both sets of rules applied.

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

When sharing the files of internal custom formats with others, you can also share the workspace settings (file `.vscode/settings.json`) along with the files and make the text decoration rules available to them. If you share your files via a Git repo, you can now also accept the fixes and contributions to the text decoration rules from other users.

## Known Issues

All the below are minor issues and in most cases, should not affect your experience. These are all results of various platform limitations.

- Text decorations do not show in the minimap. As an example, if you color all lines in a log file with text `Failed` with red color, you will not be able to see those red lines in the minimap. You will need to scroll through the document to find them. This is due to a limitation with Visual Studio Code. They need to keep it performant.

- If the text matches multiple rules, one of them has property `underline` set to either `true` or `false` and the other one has `strikeThrough` set to either `true` or `false`, only the first rule in the sequence of configurations will be applied. This is due to how CSS works and making the behavior any different would have created further confusion when these decorations are applied on top of the text rendered by the color theme. Anyway, why would you want to underline and strike out the text at the same time? :)

- While adding the configuration inside user or workspace settings, before you add any of the text decoration properties, Visual Studio Code would show JSON schema validation error `Missing Property "color".` This is because it is not able to correctly handle some of the advanced JSON schema attributes. This is possibly a design choice than a bug. Just ignore the message. Once you add any property (e.g., `bold`), the schema validation error will correctly disappear.

- It was thought to add support for having one pattern for matching the text, and another pattern for applying the decorations. For example, if someone sets the text pattern with a capture-group such as `(\\w+) - done`, just the text matching the capture group i.e., `Shopping` out of `Shopping - done` would be decorated. However, Node.js does not have support for locating indices of each capture group. See row for `hasIndices` flag inside [Browser compatibility chart](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility). This is required by extension for locating the text positions. This feature will be added to the extension once Node.js gets support for `hasIndices` flag.

## Meta Section

### Background

This extension was developed as part of [Microsoft Hackathon 2022](https://news.microsoft.com/life/hackathon/) project. A week before the Hackathon week, I was looking to color lines where shared variables are accessed inside a C# file to visibly ensure there are no concurrency issues present inside the code. I could not find a great extension that fulfilled my requirements, hence came up with the idea to build an extension by myself. I hope more similar use cases will be uncovered with this extension and it will serve many people and teams.

### Non-Goals

Some of these non-goals were set considering my little experience working on JavaScript and TypeScript, and the short time I had to work on the extension. But now the project is nearing completion, I think all of these were the right choices. I do not intend to convert any of these non-goals into goals at the time of this writing.

- Adding support for hierarchical configuration similar to `.editorconfig` file.
- Adding support for wildcard text patterns like `a???b` or simply plain text search.
- Adding support to 'Match Whole Word'. Regex patterns should be sufficient to meet this requirement.
- Providing functionality through commands and with keyboard shortcuts.
- Adding GUI experience. I believe all developers would prefer setting file over UI.
- Decomposing functionality into several TypeScript classes and/or modules.
- Writing unit and integration tests.
- Giving special treatment to the setting file. For example, coloring the JSON-text for each rule with the decoration mentioned in that rule.
