import * as fs from "fs";
import { generateDataAccessLayer } from "../CrudBuilder";
import { formatCode } from "../Formatter";
import { db } from "./setup";

test("insert", () => {
    generateDataAccessLayer(db.getTables()[0], {
        outDir: "./temp"
    });
    const tests: string[][] = [
        ["specs/crud.txt", "temp/table1/generated.ts"],
        ["specs/index.txt", "temp/table1/index.ts"]
    ];
    tests.forEach(rec => {
        let [spec, result] = rec;
        spec = formatCode(fs.readFileSync(spec).toString());
        result = formatCode(fs.readFileSync(result).toString());
        expect(result).toEqual(spec);
    });
});
