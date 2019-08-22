import {
    camelCase,
    ensureFilePath,
    forEach,
    isNullOrUndef,
    isNullOrUndefDefault,
    isObject,
    isString,
    wrapInArray
} from "@blendsdk/stdlib";
import * as fs from "fs";
import { IAPIComponent, IAPIComponentProperty, IAPIEndpoint, IAPIImport, IAPISpecification } from "./APISpec";
import { formatCode } from "./Formatter";
import { generateInterface, ITypeProperty } from "./TypeBuilder";

/**
 * Interface for configuring the generateRouter method
 *
 * @export
 * @interface IGenerateRouter
 */
export interface IGenerateRouter {
    routerOutFile: string;
    typesOutFile: string | string[];
}

/**
 * Converts an IAPIComponent to an ITypeProperty
 *
 * @param {IAPIComponent} component
 * @returns {ITypeProperty[]}
 */
function componentToTypeProperty(component: IAPIComponent): ITypeProperty[] {
    const result: ITypeProperty[] = [];
    forEach<IAPIComponentProperty>(component, (prop, name: string) => {
        (prop as ITypeProperty).name = name;
        result.push(prop as any);
    });
    return result;
}

/**
 * Check if a value is an import statement
 *
 * @param {*} obj
 * @returns {boolean}
 */
function isImport(obj): boolean {
    return !isNullOrUndef(obj) && isObject(obj) && obj.name && obj.from;
}

/**
 * Creates `import` statements for the route controllers
 *
 * @param {IAPIImport} imports
 * @returns {string}
 */
function createImports(imports: IAPIImport | IAPIImport[], result: string[]) {
    wrapInArray<IAPIImport>(imports || []).forEach(item => {
        if (isImport(item)) {
            result.push(`import { ${item.name} } from "${item.from}";`);
        }
    });
}

/**
 * Crreate IRouteParameters for IRoute definitions
 *
 * @param {IAPIComponent} params
 * @returns {string}
 */
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

/**
 * Create the IRoute definitions
 *
 * @param {IAPIEndpoint} route
 * @returns {string}
 */
function createRoute(route: IAPIEndpoint): string {
    const result: string[] = [],
        controller = !isNullOrUndef(route.backend.controller)
            ? isString(route.backend.controller)
                ? route.backend.controller
                : (route.backend.controller as IAPIImport).name
            : null;
    result.push("{");
    result.push(`method:"${route.method}",`);
    result.push(`endpoint:"${route.url}",`);
    result.push(`controller:${controller},`);
    result.push(`secure:${isNullOrUndefDefault(route.secure, true)},`);
    // handle the middelwares
    if (route.backend.middleware) {
        const items = wrapInArray(route.backend.middleware).map((item: any) => {
            if (isString(item)) {
                return item;
            } else if (isImport(item)) {
                return item.name;
            }
        });
        if (items.length !== 0) {
            result.push(`middlewares:${items.length === 1 ? items.join("") : `[${items.join(",")}]`},`);
        }
    }
    if (route.backend.requestType && Object.keys(route.backend.requestType).length !== 0) {
        result.push(`parameters:\{${generateRouteParameters(route.backend.requestType)}\}`);
    }
    result.push("}");
    return result.join("\n");
}

/**
 * Cleans a url by replacing // to /
 *
 * @param {string} url
 * @returns {string}
 */
function cleanUrl(url: string): string {
    for (let a = 0; a !== 10; a++) {
        url = url.replace(/\/\//gi, "/");
    }
    return url;
}

/**
 * Generates the endpoint url based on the endpoint configuration
 *
 * @param {IAPIEndpoint} endpoint
 * @param {IAPISpecification} spec
 * @returns
 */
function generateEndpointUrl(endpoint: IAPIEndpoint, spec: IAPISpecification) {
    return isNullOrUndefDefault(endpoint.absoluteUrl, false)
        ? endpoint.url
        : cleanUrl(["/", spec.application, spec.version ? "v" + spec.version : "/", endpoint.url].join("/"));
}

/**
 * Generates a backend route definition and request/reponse types
 * as TypeScript interfaces
 *
 * @export
 * @param {IAPISpecification} spec
 * @param {IGenerateRouter} [config]
 */
export function generateRouter(spec: IAPISpecification, config?: IGenerateRouter) {
    // set the defaults
    spec.application = spec.application || "";
    config = config || { routerOutFile: undefined, typesOutFile: undefined };
    config.routerOutFile = isNullOrUndefDefault(config.routerOutFile, "router.ts");
    config.typesOutFile = isNullOrUndefDefault(config.typesOutFile, "types.ts");

    // results variables declaration
    const result: string[] = [];
    const components = spec.components || {};
    const endpoints = spec.endpoints || [];
    const routes: string[] = [];
    const types: string[] = [];
    const imports: string[] = [`import { IRoute } from "@blendsdk/express";`];

    // loop to generate the endpoint definitions
    forEach<IAPIEndpoint>(endpoints, (endpoint: IAPIEndpoint) => {
        // normalize and fix the url
        endpoint.url = generateEndpointUrl(endpoint, spec);

        if (endpoint.backend) {
            // create imports for the backend
            createImports(endpoint.backend.imports, imports);
            createImports(endpoint.backend.controller as IAPIImport, imports);
            createImports(endpoint.backend.middleware as IAPIImport, imports);
            routes.push(createRoute(endpoint));
        }
    });

    // merge the generated routes
    result.push(imports.join("\n"));
    result.push("");
    result.push(`const routes:IRoute[] = [`);
    result.push(routes.join(",\n"));
    result.push(`]`);
    result.push("");
    result.push(`export default routes;`);

    // loop to create the response/request interfaces
    forEach<IAPIComponent>(components, (value, name: string) => {
        types.push(generateInterface(camelCase(`${spec.application}_${name}`), componentToTypeProperty(value)));
    });

    // write the results to files
    ensureFilePath(config.routerOutFile);
    fs.writeFileSync(config.routerOutFile, formatCode(result.join("\n")));
    wrapInArray<string>(config.typesOutFile).forEach(fileName => {
        ensureFilePath(fileName);
        fs.writeFileSync(fileName, formatCode(types.join("\n")));
    });
}
