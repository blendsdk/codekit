import { generateRouter } from "../RouterBuilder";
import { api } from "./apispec";

test("generate router", () => {
    generateRouter(api, {
        routerOutFile: "src/tests/_delete_router.ts",
        typesOutFile: ["src/tests/_delete_types.ts"]
    });
});
