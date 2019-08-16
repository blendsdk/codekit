import { Column } from "@blendsdk/schemakit/dist/database/Column";
import { Table } from "@blendsdk/schemakit/dist/database/Table";
import { camelCase, isNullOrUndefDefault, wrapInArray } from "@blendsdk/stdlib";
import chalk from "chalk";
import * as fs from "fs";
import mkdirp = require("mkdirp");
import * as path from "path";
import { formatCode } from "./Formatter";
import { columnsToTypeProperties, generateInterface, getInterfaceName } from "./TypeBuilder";

/**
 * Interface for configuring a an IDataAccessLayerTable
 *
 * @export
 * @interface IDataAccessLayerTable
 */
export interface IDataAccessLayerTable {
    insert?: boolean;
    select?: boolean;
    update?: boolean;
    delete?: boolean;
}

/**
 * Interface for configuring an IDataAccessLayer
 *
 * @export
 * @interface IDataAccessLayer
 */
export interface IDataAccessLayer {
    outDir?: string;
    curdFileName?: string;
    relativeDBTypesPackage?: string;
    tables?: {
        [tableName: string]: IDataAccessLayerTable | boolean;
    };
}

/**
 * Fixes the table name by removing the "." as the schema.relation
 * separator.
 *
 * @param {string} name
 * @returns
 */
function fixName(name: string) {
    return name.replace(/\./gi, "_");
}

/**
 * Creates a partial method name from given Columns
 *
 * @param {(Column | Column[])} columns
 * @returns {string}
 */
function columnsToMethodName(columns: Column | Column[]): string {
    const result: string[] = [];
    wrapInArray<Column>(columns).forEach((c: Column) => {
        result.push(c.getName());
    });
    return result.join("_and_");
}

/**
 * Creates SQL assignment parameters from given Columns
 *
 * @param {(Column | Column[])} columns
 * @returns {string}
 */
function columnsToSQLParams(columns: Column | Column[]): string {
    const result: string[] = [];
    wrapInArray<Column>(columns).forEach((c: Column) => {
        result.push(`${c.getName()} = :${c.getName()}`);
    });
    return result.join(" AND ");
}

/**
 * Creates a method name given a prefix and Columns
 *
 * @param {string} prefix
 * @param {string} name
 * @param {(Column | Column[])} columns
 * @returns {string}
 */
function getMethodName(prefix: string, name: string, columns: Column | Column[]): string {
    return `${prefix}${camelCase(name)}By${camelCase(columnsToMethodName(columns))}`;
}

/**
 * Creates a select by primary key command
 *
 * @export
 * @param {Table} table
 * @returns
 */
export function createSelectByPrimaryKey(table: Table) {
    const columns = table.getPrimaryKey().getColumns();
    const tableName = fixName(table.getName());
    const methodName = getMethodName("get", tableName, columns);
    const retInterface = getInterfaceName(tableName);
    const inpInterface = getInterfaceName(methodName);
    const sql = `"SELECT * FROM ${tableName} WHERE ${columnsToSQLParams(columns)}"`;
    const method = `
/**
 * Gets a record from the ${tableName} relation
 */
export const ${methodName} = sql_query<${retInterface}, ${inpInterface}>(${sql},{ single: true });
`;
    return [
        generateInterface(methodName, columnsToTypeProperties(table.getPrimaryKey().getColumns())).trim(),
        method
    ].join("\n");
}

/**
 * Creates an insert method command
 *
 * @export
 * @param {Table} table
 * @returns
 */
export function createInsertMethod(table: Table) {
    const tableName = fixName(table.getName());
    const methodName = `insertInto${camelCase(tableName)}`;
    const retInterface = getInterfaceName(tableName);
    const inpInterface = getInterfaceName(tableName);
    const method = `
/**
 * Insert a record into the ${tableName} relation
 */
export const ${methodName} = sql_insert<${retInterface}, ${inpInterface}>("${tableName}");
`;
    return method;
}

/**
 * Creates a delete by primary key command
 *
 * @export
 * @param {Table} table
 * @returns
 */
export function createDeleteByPrimaryKey(table: Table) {
    const columns = table.getPrimaryKey().getColumns();
    const tableName = fixName(table.getName());
    const methodName = getMethodName("delete", tableName, columns);
    const retInterface = getInterfaceName(tableName);
    const inpInterface = getInterfaceName(methodName);
    const method = `
/**
 * Deletes a record from the ${tableName} relation
 */
export const ${methodName} = sql_delete<${retInterface}, ${inpInterface}>("${tableName}", { single: true } );
`;
    return [generateInterface(methodName, columnsToTypeProperties(table.getPrimaryKey().getColumns())), method].join(
        "\n"
    );
}

/**
 * Creates an update by primary key command
 *
 * @export
 * @param {Table} table
 * @returns
 */
export function createUpdateByPrimaryKey(table: Table) {
    const columns = table.getPrimaryKey().getColumns();
    const tableName = fixName(table.getName());
    const methodName = getMethodName("update", tableName, columns);
    const retInterface = getInterfaceName(tableName);
    const inpInterface = getInterfaceName(methodName);
    const method = `
/**
 * Updates a record from the ${tableName} relation
 */
export const ${methodName} = sql_update<${retInterface}, ${retInterface}, ${inpInterface}>("${tableName}", { single: true } );
`;
    return [generateInterface(methodName, columnsToTypeProperties(table.getPrimaryKey().getColumns())), method].join(
        "\n"
    );
}

/**
 * Normalized the parameters for the generateDataAccessLayerAPI method.
 *
 * @param {(Table | Table[])} table
 * @param {IDataAccessLayer} config
 * @returns {IDataAccessLayer}
 */
function normalizeDataAccessLayerAPIConfig(table: Table | Table[], config: IDataAccessLayer): IDataAccessLayer {
    config = config || {};
    config.outDir = config.outDir || process.cwd();
    config.relativeDBTypesPackage = config.relativeDBTypesPackage || "../dbtypes";
    config.tables = config.tables || {};
    config.curdFileName = config.curdFileName || "generated";

    wrapInArray<Table>(table).forEach(item => {
        const tableName = fixName(item.getName());
        config.tables[tableName] = isNullOrUndefDefault(config.tables[tableName], {
            insert: true,
            select: true,
            update: true,
            delete: true
        });
        (config.tables[tableName] as any).insert = isNullOrUndefDefault((config.tables[tableName] as any).insert, true);
        (config.tables[tableName] as any).select = isNullOrUndefDefault((config.tables[tableName] as any).select, true);
        (config.tables[tableName] as any).update = isNullOrUndefDefault((config.tables[tableName] as any).update, true);
        (config.tables[tableName] as any).delete = isNullOrUndefDefault((config.tables[tableName] as any).delete, true);
    });
    return config;
}

/**
 * Generates CRUD based on the given Tables and a configuration.
 *
 * @export
 * @param {(Table | Table[])} table
 * @param {IDataAccessLayer} [config]
 */
export function generateDataAccessLayer(table: Table | Table[], config?: IDataAccessLayer) {
    config = normalizeDataAccessLayerAPIConfig(table, config);

    const result: { [tableName: string]: string[] } = {};
    wrapInArray<Table>(table).forEach(item => {
        const tableName = fixName(item.getName());
        const cfg = config.tables[tableName] as IDataAccessLayerTable;
        if (cfg) {
            console.log(chalk.green(`Generating CRUD for ${tableName}`));
            result[tableName] = [
                `/**`,
                ` * DO NOT CHANGE THIS FILE!`,
                ` * This file is automatically generated.`,
                ` */`,
                `import { ${getInterfaceName(tableName)} } from "${config.relativeDBTypesPackage}";`,
                `import { sql_insert, sql_query, sql_update, sql_delete } from "@blendsdk/sqlkit";`
            ];

            if (cfg.insert) {
                result[tableName].push(createInsertMethod(item));
            }
            if (cfg.select) {
                result[tableName].push(createSelectByPrimaryKey(item));
            }
            if (cfg.update) {
                result[tableName].push(createUpdateByPrimaryKey(item));
            }
            if (cfg.delete) {
                result[tableName].push(createDeleteByPrimaryKey(item));
            }
        }
    });

    Object.keys(result).forEach(tableName => {
        const outFolder = path.join(config.outDir, tableName);
        const indexFilePath = path.join(outFolder, "index.ts");
        mkdirp.sync(outFolder);
        if (!fs.existsSync(indexFilePath)) {
            fs.writeFileSync(indexFilePath, `export * from "./${config.curdFileName}";`);
        }
        const filePath = path.join(outFolder, `${config.curdFileName}.ts`);
        fs.writeFileSync(filePath, formatCode(result[tableName].join("\n")));
    });
}
