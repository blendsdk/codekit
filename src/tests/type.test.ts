import * as fs from "fs";
import { formatCode } from "../Formatter";
import { generateInterface, generateInterfaceForTable, generateInterfacesFromTables } from "../TypeBuilder";
import { db } from "./setup";

test("simple type", () => {
    const result = generateInterface("TestInterface", [
        {
            name: "prop1",
            type: "string",
            description: "This is property1"
        },
        {
            name: "prop2",
            type: "string",
            array: true
        },
        {
            name: "prop3",
            type: "string",
            optional: true
        },
        {
            name: "prop4",
            type: "number",
            optional: true,
            array: true
        }
    ]);
    const check = formatCode(fs.readFileSync("specs/type.txt").toString());
    expect(result).toEqual(check);
});

test("db table", () => {
    const result = generateInterfaceForTable(db.getTables()[0]);
    const check = formatCode(fs.readFileSync("specs/table.txt").toString());
    expect(result).toEqual(check);
});

test("db table multiple", () => {
    generateInterfacesFromTables("gen.txt", db.getTables());
    const check = formatCode(fs.readFileSync("specs/tables.txt").toString());
    const result = formatCode(fs.readFileSync("gen.txt").toString());
    fs.unlinkSync("gen.txt");
    expect(result).toEqual(check);
});
