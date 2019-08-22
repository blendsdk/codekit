import { forEach } from "@blendsdk/stdlib";
import * as fs from "fs";
import { IAPISpecification } from "../APISpec";
import { formatCode } from "../Formatter";
import { generateRouter } from "../RouterBuilder";
import { specs } from "./apispec";

forEach<IAPISpecification>(specs, (item: IAPISpecification, name: string) => {
    test(`Router test ${name}`, () => {
        const routerOutFile = `temp/router/${name}/router.ts`,
            typesOutFile = `temp/router/${name}/types.ts`;
        generateRouter(item, {
            routerOutFile,
            typesOutFile
        });
        const tests: string[] = [routerOutFile, typesOutFile];
        tests.forEach(testFile => {
            const spec = formatCode(
                fs.readFileSync(testFile.replace("temp/", "specs/").replace(".ts", ".ts.txt")).toString()
            );
            const result = formatCode(fs.readFileSync(testFile).toString());
            expect(result).toEqual(spec);
        });
    });
});
