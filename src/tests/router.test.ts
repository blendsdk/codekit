import { IAPISpecification, IAPIComponent } from "../APISpec";

const tokenResponse: IAPIComponent = {
    success: { type: "boolean" },
    token: { type: "string" }
}

const authorizationRequest: IAPIComponent = {
    username: { type: "string", message: "username is required" },
    password: { type: "string", message: "password is required" },
    languageCode: { type: "string", optional: true }
}

const greetRequest: IAPIComponent = {
    name: { type: "string", message: "name is required" }
}

const greetResponse: IAPIComponent = {
    message: { type: "string" }
}

export const api: IAPISpecification = {
    application:"api",
    version:2,
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
            request: authorizationRequest,
            response: {
                200: tokenResponse,
                400: {},
                404: {},
                500: {}
            }
        },
        {
            name: "greet",
            method: 'get',
            url: "/hello/:name",
            controller: "greetController",
            imports: [
                {
                    name: "greetController",
                    from: "../controllers/greetController"
                }
            ],
            request: greetRequest,
            response: {
                200: greetRequest
            }
        }
    ],
    components: {
        tokenResponse,
        authorizationRequest,
        greetRequest,
        greetResponse
    }
};


import { generateRouter } from '../RouterBuilder';
test("generate router", () => {
    generateRouter(api, {
        outFile: "src/tests/test1.ts"
    });
});