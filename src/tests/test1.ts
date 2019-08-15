import { IRoute } from "@blendsdk/express";
import { loginController } from "../controllers/loginController";
import { greetController } from "../controllers/greetController";
/**
 * The IApiTokenResponse interface.
 *
 * @interface IApiTokenResponse
 * @export
 */
export interface IApiTokenResponse {
	/**
	 * @type {boolean}
	 * @memberof IApiTokenResponse
	 */
	success: boolean;
	/**
	 * @type {string}
	 * @memberof IApiTokenResponse
	 */
	token: string;
}

/**
 * The IApiAuthorizationRequest interface.
 *
 * @interface IApiAuthorizationRequest
 * @export
 */
export interface IApiAuthorizationRequest {
	/**
	 * @type {string}
	 * @memberof IApiAuthorizationRequest
	 */
	username: string;
	/**
	 * @type {string}
	 * @memberof IApiAuthorizationRequest
	 */
	password: string;
	/**
	 * @type {string}
	 * @memberof IApiAuthorizationRequest
	 */
	languageCode?: string;
}

/**
 * The IApiGreetRequest interface.
 *
 * @interface IApiGreetRequest
 * @export
 */
export interface IApiGreetRequest {
	/**
	 * @type {string}
	 * @memberof IApiGreetRequest
	 */
	name: string;
}

/**
 * The IApiGreetResponse interface.
 *
 * @interface IApiGreetResponse
 * @export
 */
export interface IApiGreetResponse {
	/**
	 * @type {string}
	 * @memberof IApiGreetResponse
	 */
	message: string;
}

const ApiRoutes: IRoute[] = [
	{
		method: "post",
		endpoint: "/api/v2/login",
		controller: loginController,
		secure: true,
		parameters: {
			username: {
				message: "username is required",
				type: "string"
			},
			password: {
				message: "password is required",
				type: "string"
			},
			languageCode: {
				optional: true,
				type: "string"
			}
		}
	},
	{
		method: "get",
		endpoint: "/api/v2/hello/:name",
		controller: greetController,
		secure: true,
		parameters: {
			name: {
				message: "name is required",
				type: "string"
			}
		}
	}
];
export { ApiRoutes };
