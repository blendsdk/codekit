import eol from "eol";
import prettier from "prettier";

/**
 * Formats the TS code
 *
 * @export
 * @param {*} source
 * @returns
 */
export function formatCode(source) {
    return eol.auto(
        prettier.format(source, {
            semi: true,
            arrowParens: "avoid",
            parser: "typescript",
            bracketSpacing: true,
            endOfLine: "auto",
            printWidth: 120,
            proseWrap: "preserve",
            quoteProps: "as-needed",
            useTabs: true,
            trailingComma: "none"
        })
    );
}
