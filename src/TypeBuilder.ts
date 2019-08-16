import { Column } from "@blendsdk/schemakit/dist/database/Column";
import { Table } from "@blendsdk/schemakit/dist/database/Table";
import { eDBColumnType } from "@blendsdk/schemakit/dist/database/Types";
import { camelCase } from "@blendsdk/stdlib/dist/camelCase";
import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import * as fs from "fs";
import { formatCode } from "./Formatter";

export interface ITypeProperty {
    name: string;
    type: string;
    array?: boolean;
    optional?: boolean;
    description?: string;
}

/**
 * Maps generic types to typescript types.
 *
 * @export
 * @param {eDBColumnType} type
 * @returns {string}
 */
function mapColumnType(type: eDBColumnType): string {
    switch (type) {
        case eDBColumnType.string:
            return "string";
        case eDBColumnType.number:
            return "number";
        case eDBColumnType.guid:
            return "string";
        case eDBColumnType.decimal:
            return "number";
        case eDBColumnType.dateTime:
            return "Date";
        case eDBColumnType.boolean:
            return "boolean";
        case eDBColumnType.autoIncrement:
            return "number";
        default:
            throw Error(`Undefined column type ${type}`);
    }
}

/**
 * Maps a Column to a ITypeProperty
 *
 * @param {Column} column
 * @returns {ITypeProperty}
 */
function columnToTypeProperty(column: Column): ITypeProperty {
    return {
        name: column.getName(),
        type: mapColumnType(column.getType()),
        optional: true,
        array: false
    };
}

/**
 * Maps a collection of columns to ITypeProperties
 *
 * @export
 * @param {(Column | Column[])} column
 * @returns {ITypeProperty[]}
 */
export function columnsToTypeProperties(column: Column | Column[]): ITypeProperty[] {
    return wrapInArray<Column>(column).map(c => {
        return columnToTypeProperty(c);
    });
}

/**
 * Generates an interface
 * @export
 * @param {Table} table
 * @returns
 */
export function generateInterfaceForTable(table: Table) {
    return generateInterface(
        table.getName(),
        columnsToTypeProperties(table.getColumns()),
        `Interface describing a ${table.getName()} record.`
    );
}

/**
 * Geta an interface name based on the given value
 *
 * @export
 * @param {string} name
 * @returns {string}
 */
export function getInterfaceName(name: string): string {
    return `I${camelCase(name.replace(/\./gi, "_"))}`;
}

/**
 * Generates an interface
 *
 * @export
 * @param {string} tableName
 * @param {(ITypeProperty | ITypeProperty[])} properties
 * @returns
 */
export function generateInterface(
    interfaceName: string,
    properties: ITypeProperty | ITypeProperty[],
    description?: string
) {
    interfaceName = getInterfaceName(interfaceName);
    const template: string[] = [
        `/**`,
        ` * ${description ? description : `The ${interfaceName} interface.`}`,
        ` *`,
        ` * @interface ${interfaceName}`,
        ` * @export`,
        ` */`,
        `export interface ${interfaceName} {`
    ];
    wrapInArray<ITypeProperty>(properties).forEach(prop => {
        const type = `${prop.type}${prop.array ? "[]" : ""}`;
        template.push("/**");
        if (prop.description) {
            template.push("\t * " + prop.description);
        }
        template.push(`\t * @type \{${type}\}`);
        template.push(`\t * @memberof ${interfaceName}`);
        template.push("\t */");
        template.push(`\t${prop.name}${prop.optional ? "?" : ""}: ${type};`);
    });
    template.push(`}`);
    return formatCode(template.join("\n"));
}

/**
 * Creates TypeScript interfaces based on
 * Table objects
 *
 * @export
 * @param {string} outFile
 * @param {Table[]} tables
 */
export function generateInterfacesFromTables(outFile: string, tables: Table[]) {
    const result: string[] = [];
    tables.forEach(table => {
        result.push(generateInterfaceForTable(table).trim());
    });
    fs.writeFileSync(outFile, result.join("\n\n"));
}
