import Koa from "koa";
import mount from "koa-mount";
import serve from "koa-static";
import { PassThrough } from "stream";

const app = new Koa();

app.use(mount("/static", serve(__dirname + "/public")));

app.use(mount("/events", ctx => {
  const stream = new PassThrough();

  const send = (data: string) => {
    stream.write(`data: ${ data }\n\n`);
  };

  const interval = setInterval(() => {
    send("Je moeder!");
  }, 100);

  const stop = () => {
    clearInterval(interval);
    ctx.res.end();
  };

  ctx.req.on("close", stop);
  ctx.req.on("finish", stop);
  ctx.req.on("error", stop);

  ctx.type = "text/event-stream";
  ctx.body = stream;
}));

app.listen(3000);
console.log("App is listening on port 3000");
