import { IAPISpecification, IAPIComponent, IAPIComponentProperty, IAPIEndpoint, IAPIImport } from './APISpec';
import { forEach, wrapInArray, isNullOrUndefDefault, camelCase, ucFirst } from '@blendsdk/stdlib';
import { generateInterface, ITypeProperty } from './TypeBuilder';
import * as fs from "fs";
import { formatCode } from './Formater';

export interface IGenerateRouter {
    variableName?: string;
    outFile: string;
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
        const part:string[] = [];
        part.push(`${name} : {`);
        if(param.message !== undefined) {
            part.push(`message: "${param.message}",`);
        }
        if(param.array !== undefined) {
            part.push(`array: ${param.array},`);
        }
        if(param.optional !== undefined) {
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
    result.push(`secure:${route.secure || true},`);
    if (route.request && Object.keys(route.request).length !== 0) {
        result.push(`parameters:\{${generateRouteParameters(route.request)}\}`);
    }
    result.push("}");
    return result.join("\n")
}

export function generateRouter(spec: IAPISpecification, config?: IGenerateRouter) {

    // spec.version = spec.version || ;
    spec.application = spec.application || '';    
    config = config || { outFile: undefined };
    config.outFile = isNullOrUndefDefault(config.outFile, "router.ts");
    config.variableName = isNullOrUndefDefault(config.variableName, camelCase(`${spec.application}_routes`));
    
    const result: string[] = [];
    const components = spec.components || {};
    const endpoints = spec.endpoints || [];
    const routes: string[] = [];
    const imports: string[] = [
        `import { IRoute } from "@blendsdk/express";`
    ];

    forEach<IAPIEndpoint>(endpoints, (endpoint: IAPIEndpoint) => {

        endpoint.url = ["/",spec.application,(spec.version ?  "v"+ spec.version: '/'),endpoint.url].join("/")
        .replace(/\/\//gi,'/')
        .replace(/\/\//gi,'/')
        .replace(/\/\//gi,'/');

        // Create the imports
        wrapInArray<IAPIImport>(endpoint.imports || []).forEach((i) => {
            imports.push(createImport(i));
        })
        routes.push(createRoute(endpoint));
    })

    result.push(imports.join("\n"));

    forEach<IAPIComponent>(components, (value, name: string) => {
        result.push(generateInterface(camelCase(`${spec.application}_${name}`), componentToTypeProperty(value)));
    });

    result.push(`const ${config.variableName}:IRoute[] = [`);
    result.push(routes.join(",\n"));
    result.push(`]`);

    result.push(`export \{${config.variableName}\};`);

    fs.writeFileSync(config.outFile, formatCode(result.join("\n")));
}