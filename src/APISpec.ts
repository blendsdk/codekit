import { ITypeProperty } from "./TypeBuilder";

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
 * Type describing one or more objects or interfaces either as
 * a single object or objects that also need to be imported first.
 */
export type TAnyHandlerComponent = string | string[] | IAPIImport | IAPIImport[] | Array<string | IAPIImport>;

/**
 * Type describing a object or interface either as
 * a single object or an object that also need to be imported first.
 */
export type THandlerComponent = string | IAPIImport;

/**
 * Interface describing the backend on an endpoint
 *
 * @export
 * @interface IAPIEndpointBackend
 */
export interface IAPIEndpointBackend {
    /**
     * Property to define a backend controller
     * for this endpoint
     *
     * @type {THandlerComponent}
     */
    controller: THandlerComponent;
    /**
     * Property to define one or more express.js middleware
     * handlers for this endpoint.
     *
     * @type {TAnyHandlerComponent}
     */
    middleware?: TAnyHandlerComponent;
    /**
     * The type interface of the incoming request.
     *
     * @type {IAPIComponent}
     */
    requestType: IAPIComponent;
    /**
     * The type interface of the returning response from.
     * the server
     *
     * @type {IAPIComponent}
     */
    responseType: IAPIComponent;
    /**
     * Property to define custom imports
     *
     * @type {(IAPIImport | IAPIImport[])}
     */
    imports?: IAPIImport | IAPIImport[];
}

/**
 * Interface describing an API endpoint.
 *
 * @export
 * @interface IAPIEndpoint
 */
export interface IAPIEndpoint {
    /**
     * Methods allowd in the REST endpoint specification
     *
     * @type {("get" | "post" | "patch" | "delete")}
     * @memberof IAPIEndpoint
     */
    method: "get" | "post" | "patch" | "delete";
    /**
     * The URL value of this endpoint
     *
     * @type {string}
     * @memberof IAPIEndpoint
     */
    url: string;
    /**
     * Flag indicating whether this URL is absolute.
     * In which case no application or version number
     * will be prefixed to the URL
     *
     * @type {boolean}
     * @memberof IAPIEndpoint
     */
    absoluteUrl?: boolean;
    /**
     * Flag indicating that this endpoint needs to be
     * called with a Bearer token.
     *
     * @type {boolean}
     */
    secure?: boolean;
    /**
     * Segment to describe the backend of this endpoint.
     *
     * @type {IAPIEndpointBackend}
     * @memberof IAPIEndpoint
     */
    backend?: IAPIEndpointBackend;
    /**
     * Segment to describe the frontend of this endpoint.
     *
     * @type {{
     *         controller: THandlerComponent;
     *         middleware?: TAnyHandlerComponent;
     *         responseType: IAPIComponent;
     *     }}
     * @memberof IAPIEndpoint
     */
    frontend?: {
        /**
         * The name of the method that is generated
         * in the frontend code.
         *
         * @type {string}
         */
        methodName: string;
        /**
         * Property to define an optional frontend controller
         * for this endpoint. The frontend controller, if provided, must be
         * derived from:
         *
         *  `@blendsdk/clientkit/EndpointHandler<RequestType, ResponseType>`
         *
         * @type {THandlerComponent}
         */
        controller?: THandlerComponent;
        /**
         * Property to define custom imports
         *
         * @type {(IAPIImport | IAPIImport[])}
         */
        imports: IAPIImport | IAPIImport[];
    };
}

/**
 * Interface for describing the properties of an "interface"
 * component
 *
 * @export
 * @interface IAPIComponentProperty
 */
export interface IAPIComponentProperty extends Omit<ITypeProperty, "name"> {
    message?: string;
}

/**
 * Interface describing API specifications
 *
 * @export
 * @interface IAPISpecification
 */
export interface IAPISpecification {
    application?: string;
    version?: number;
    endpoints: IAPIEndpoint[];
    components?: {
        [name: string]: IAPIComponent;
    };
}
