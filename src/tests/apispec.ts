import { IAPIComponent, IAPISpecification } from "../APISpec";

const endpointRequest: IAPIComponent = {
    question: { type: "string", message: "parameter1 is required" }
};

const endpointResponse: IAPIComponent = {
    answer: { type: "string" }
};

const minimal: IAPISpecification = {
    endpoints: []
};

const minimal_endpoint: IAPISpecification = {
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1",
                requestType: endpointRequest,
                responseType: endpointResponse
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const app_name: IAPISpecification = {
    application: "app1",
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1",
                requestType: endpointRequest,
                responseType: endpointResponse
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const version: IAPISpecification = {
    version: 3,
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1",
                requestType: endpointRequest,
                responseType: endpointResponse
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const app_name_version: IAPISpecification = {
    application: "test1",
    version: 4,
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1",
                requestType: endpointRequest,
                responseType: endpointResponse
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const controller_import: IAPISpecification = {
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: {
                    name: "controller1",
                    from: "/path/to/controller"
                },
                requestType: endpointRequest,
                responseType: endpointResponse
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const backend_import: IAPISpecification = {
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1({config:true})",
                requestType: endpointRequest,
                responseType: endpointResponse,
                imports: {
                    name: "controller1",
                    from: "/path/to/file"
                }
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const middleware_import_single: IAPISpecification = {
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1({config:true})",
                requestType: endpointRequest,
                responseType: endpointResponse,
                middleware: {
                    name: "is_authenticated",
                    from: "/path/to/file"
                }
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const middleware_import_multiple: IAPISpecification = {
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1({config:true})",
                requestType: endpointRequest,
                responseType: endpointResponse,
                middleware: [
                    {
                        name: "is_authenticated",
                        from: "/path/to/file"
                    },
                    {
                        name: "check1",
                        from: "path/to/check1"
                    }
                ]
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

const middleware_import_multiple_mixed: IAPISpecification = {
    endpoints: [
        {
            method: "post",
            url: "/endpoint1",
            backend: {
                controller: "controller1({config:true})",
                requestType: endpointRequest,
                responseType: endpointResponse,
                middleware: [
                    `has_role("admin")`,
                    {
                        name: "is_authenticated",
                        from: "/path/to/file"
                    },
                    {
                        name: "check1",
                        from: "path/to/check1"
                    }
                ],
                imports: {
                    name: "has_role",
                    from: "/path/to/has_role"
                }
            }
        }
    ],
    components: {
        endpointRequest,
        endpointResponse
    }
};

export const specs: {
    [name: string]: IAPISpecification;
} = {
    minimal,
    minimal_endpoint,
    app_name,
    version,
    app_name_version,
    controller_import,
    backend_import,
    middleware_import_single,
    middleware_import_multiple,
    middleware_import_multiple_mixed
};
