export type Configuration = {
    fileSelectors?: string[],
    settings?: Setting[],
};

export type Setting = {
    patterns?: string[];
    color?: Color;
    matchCase?: boolean;
    matchWholeWord?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
};

export enum Color {
    blue = 'blue',
    cyan = 'cyan',
    green = 'green',
    magenta = 'magenta',
    red = 'red',
    yellow = 'yellow',
}
