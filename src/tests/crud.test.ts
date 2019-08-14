import * as fs from "fs";
import { generateDataAccessLayer } from "../CrudBuilder";
import { db } from "./setup";

test("insert", () => {
    generateDataAccessLayer(db.getTables()[0], {});
    const tests: string[][] = [["specs/crud.txt", "table1/generated.ts"], ["specs/index.txt", "table1/index.ts"]];
    tests.forEach(rec => {
        let [spec, result] = rec;
        spec = fs.readFileSync(spec).toString();
        result = fs.readFileSync(result).toString();
        expect(result).toEqual(spec);
    });
});
