/**
 * Interface describing a module import
 *
 * @export
 * @interface IAPIImport
 */
export interface IAPIImport {
    name: string;
    from: string;
}

/**
 * Interface for describing an "interface" component
 *
 * @export
 * @interface IAPIComponent
 */
export interface IAPIComponent {
    [name: string]: IAPIComponentProperty;
}

/**
 * Interface describing an API endpoint.
 *
 * @export
 * @interface IAPIEndpoint
 */
export interface IAPIEndpoint {
    method: "get" | "post" | "patch" | "delete";
    name: string;
    url: string;
    request: IAPIComponent;
    controller: string;
    middlewares?: string[];
    imports?: IAPIImport[];
    secure?: boolean;
    response: {
        [code: number]: IAPIComponent;
    };
}

/**
 * Interface for describing the properties of an "interface"
 * component
 *
 * @export
 * @interface IAPIComponentProperty
 */
export interface IAPIComponentProperty {
    type: string;
    optional?: boolean;
    array?: boolean;
    default?: any;
}

/**
 * Interface describing API specifications
 *
 * @export
 * @interface IAPISpecification
 */
export interface IAPISpecification {
    name: string;
    version: number;
    endpoints?: IAPIEndpoint[];
    components?: {
        [name: string]: IAPIComponent;
    };
}

const api: IAPISpecification = {
    name: "api",
    version: 1,
    endpoints: [
        {
            name: "login",
            url: "login",
            method: "post",
            controller: "loginController",
            imports: [
                {
                    name: "loginController",
                    from: "../controllers/loginController"
                }
            ],
            request: {
                username: { type: "string" },
                password: { type: "string" }
            },
            response: {
                200: {},
                400: {},
                404: {},
                500: {}
            }
        }
    ]
};
