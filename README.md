# Color My Text

![color-my-text](/images/hero.png)

## Features

The VS Code extension will let users specify regular expressions and it will color the text for them. This would help users add thematic colors for files of internal non-standard formats such as log files, without requiring them to create and register a VS Code extension that understands their file formats.

Since the extension will allow regular expressions, user can choose to color just the words, group of words or entire line containing the word of their interest, such as highlighting critical/error log lines to make them distinguish from the rest of the text. Allowing only selection among theme colors will make highlighted text appear better aesthetically in both Light and Dark mode themes. At present, the plan is to put the color configuration in a separate JSON file that will apply color schemes to all matching files in the folder.

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

### 0.1.0

Initial draft release.
