export interface IAPIEndpointParameter {}
export interface IAPIEndpoint {
    method: "get" | "post" | "patch" | "delete";
    name: string;
    url: string;
    request: IAPIComponent;
    response: {
        [code: number]: IAPIComponent;
    };
}

export interface IAPIComponent {
    [name: string]: IAPIComponentProperty;
}

export interface IAPIComponentProperty {
    type: string;
    optional?: boolean;
    array?: boolean;
    default?: any;
    validate?: Function;
}

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
