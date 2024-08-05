import fastify from "fastify";

function init() {
  const app = fastify();
  app.get("/api/v1/healthz", (request, reply) => reply.send({ message: "UP" }));
  return app;
}

if (require.main === module) {
  // local development
  init().listen({ port: 3000 }, (err) => {
    if (err) console.error(err);
    console.log("Server listening on 3000");
  });
}
export default init;
