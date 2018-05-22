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

  const rnd = (max: number) => Math.floor(Math.random() * max);

  let sending = true;

  const sendPixel = () => {
    if (!sending) {
      return;
    }

    const row = rnd(12);
    const col = rnd(12);

    const red = rnd(256);
    const green = rnd(256);
    const blue = rnd(256);

    send(JSON.stringify({ row, col, red, green, blue }));

    setImmediate(sendPixel);
  };

  setImmediate(sendPixel);

  const stop = () => {
    sending = false;
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
