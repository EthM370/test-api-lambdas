import { randomUUID } from "crypto";
import fastify from "fastify";

const now = () => Date.now();
declare module 'fastify' {
  interface FastifyRequest {
    startTime: number;
  }
};

function init() {
  const app = fastify({
    logger: true,
    disableRequestLogging: true,
    genReqId: (request) => {
      const header = request.headers['x-apigateway-event'];
      if (!header) {
        return randomUUID().toString();
      }
      const typeCheckedHeader = Array.isArray(header) ? header[0] : header;
      const event = JSON.parse(decodeURIComponent(typeCheckedHeader))
      return event["requestContext"]['requestId'];
    }
  });
  app.addHook("onRequest", (req, _, done) => {
    req.startTime = now();
    req.log.info({ url: req.raw.url }, "received request");
    done();
  });

  app.addHook("onResponse", (req, reply, done) => {
    req.log.info(
      {
        url: req.raw.url,
        statusCode: reply.raw.statusCode,
        durationMs: now() - req.startTime,
      },
      "request completed"
    );
    done();
  });
  app.get("/api/v1/healthz", (_, reply) => reply.send({ message: "UP" }));
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
