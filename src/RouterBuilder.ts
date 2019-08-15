import { camelCase, forEach, isNullOrUndefDefault, ucFirst, wrapInArray } from "@blendsdk/stdlib";
import * as fs from "fs";
import { IAPIComponent, IAPIComponentProperty, IAPIEndpoint, IAPIImport, IAPISpecification } from "./APISpec";
import { formatCode } from "./Formater";
import { generateInterface, ITypeProperty } from "./TypeBuilder";

export interface IGenerateRouter {
    routerOutFile: string;
    typesOutFile: string | string[];
}

function componentToTypeProperty(component: IAPIComponent): ITypeProperty[] {
    const result: ITypeProperty[] = [];
    forEach<IAPIComponentProperty>(component, (prop, name: string) => {
        (prop as ITypeProperty).name = name;
        result.push(prop as any);
    });
    return result;
}

function createImport(imports: IAPIImport): string {
    return `import { ${imports.name} } from "${imports.from}";`;
}

function generateRouteParameters(params: IAPIComponent): string {
    const result: string[] = [];
    forEach<IAPIComponentProperty>(params, (param, name: string) => {
        const part: string[] = [];
        part.push(`${name} : {`);
        if (param.message !== undefined) {
            part.push(`message: "${param.message}",`);
        }
        if (param.array !== undefined) {
            part.push(`array: ${param.array},`);
        }
        if (param.optional !== undefined) {
            part.push(`optional: ${param.optional},`);
        }
        part.push(`type:"${param.type}"`);
        part.push(`}`);
        result.push(part.join("\n"));
    });
    return result.join(",\n");
}

function createRoute(route: IAPIEndpoint): string {
    const result: string[] = [];
    result.push("{");
    result.push(`method:"${route.method}",`);
    result.push(`endpoint:"${route.url}",`);
    result.push(`controller:${route.controller},`);
    result.push(`secure:${isNullOrUndefDefault(route.secure, true)},`);
    if (route.request && Object.keys(route.request).length !== 0) {
        result.push(`parameters:\{${generateRouteParameters(route.request)}\}`);
    }
    result.push("}");
    return result.join("\n");
}

export function generateRouter(spec: IAPISpecification, config?: IGenerateRouter) {
    // spec.version = spec.version || ;
    spec.application = spec.application || "";
    config = config || { routerOutFile: undefined, typesOutFile: undefined };
    config.routerOutFile = isNullOrUndefDefault(config.routerOutFile, "router.ts");
    config.typesOutFile = isNullOrUndefDefault(config.typesOutFile, "types.ts");
    const variableName = camelCase(`${spec.application}_routes`);

    const result: string[] = [];
    const components = spec.components || {};
    const endpoints = spec.endpoints || [];
    const routes: string[] = [];
    const types: string[] = [];
    const imports: string[] = [`import { IRoute } from "@blendsdk/express";`];

    forEach<IAPIEndpoint>(endpoints, (endpoint: IAPIEndpoint) => {
        endpoint.url = ["/", spec.application, spec.version ? "v" + spec.version : "/", endpoint.url]
            .join("/")
            .replace(/\/\//gi, "/")
            .replace(/\/\//gi, "/")
            .replace(/\/\//gi, "/");

        // Create the imports
        wrapInArray<IAPIImport>(endpoint.imports || []).forEach(i => {
            imports.push(createImport(i));
        });
        routes.push(createRoute(endpoint));
    });

    result.push(imports.join("\n"));
    result.push("");
    result.push(`const ${variableName}:IRoute[] = [`);
    result.push(routes.join(",\n"));
    result.push(`]`);
    result.push("");
    result.push(`export \{${variableName}\};`);

    forEach<IAPIComponent>(components, (value, name: string) => {
        types.push(generateInterface(camelCase(`${spec.application}_${name}`), componentToTypeProperty(value)));
    });

    fs.writeFileSync(config.routerOutFile, formatCode(result.join("\n")));
    wrapInArray<string>(config.typesOutFile).forEach(fileName => {
        fs.writeFileSync(fileName, formatCode(types.join("\n")));
    });
}
