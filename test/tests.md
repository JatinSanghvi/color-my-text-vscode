# Test File

## Multiple Rules in File

Match 1 - This text should be bright black in color.
Match 2 - This text should be bright blue in color.

## Multiple Regular Expressions in Rule

Pattern 1 - This text should be bright cyan in color.
Pattern 2 - This text should be bright cyan in color.

## Unicode Regular Expressions

Unicode Pattern - This text should be bright cyan in color.

## Property `matchCase`

`matchCase` True - This text should be bright green in color.
`matchCase` TRUE - This text should not be colored.

`matchCase` False - This text should be bright green in color.
`matchCase` FALSE - This text should be bright green in color.

`matchCase` Unspecified - This text should be bright green in color.
`matchCase` UNSPECIFIED - This text should be bright green in color.

## Property `bold`

`bold` True - This text should be bold.
`bold` False - This text should not be bold.
`bold` Unspecified - This text should not be bold.

## Property `italic`

`italic` True - This text should be italicized.
`italic` False - This text should not be italicized.
`italic` Unspecified - This text should not be italicized.

## Property `underline`

`underline` True - This text should be underlined.
`underline` False - This text should not be underlined.
`underline` Unspecified - This text should not be underlined.

## Property `strikeThrough`

`strikeThrough` True - This text should be striked out.
`strikeThrough` False - This text should not be striked out.
`strikeThrough` Unspecified - This text should not be striked out.

## File Matching Multiple Path Patterns

New Path - This text should be blue in color.

## Text Matching Multiple Regular Expression Patterns

Multiple Patterns - The quick brown fox jumps over the lazy dog.

In above,
- Text `brown fox jumps` should be bold.
- Text `fox jumps over` should be striked out.
- Text `jumps over the` should be italicized.

## Text Matching Multiple Conflicting Patterns

Conflicting Patterns - The quick brown fox jumps over the lazy dog.

In above,
- Text `brown fox jumps` should be cyan in color.
- Only text `over` should be green in color.
- Only text `the` should be magenta in color.

## Underline and StrikeThrough Behavior

`underline` then `strikeThrough` - This text should be underlined.
`strikeThrough` then `underline` - This text should be striked out.
