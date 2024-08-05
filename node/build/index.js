"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
function init() {
    const app = (0, fastify_1.default)();
    app.get("/api/v1/healthz", (request, reply) => reply.send({ message: "UP" }));
    return app;
}
if (require.main === module) {
    // local development
    init().listen({ port: 3000 }, (err) => {
        if (err)
            console.error(err);
        console.log("Server listening on 3000");
    });
}
exports.default = init;
