import assert from "node:assert/strict";
import test from "node:test";
import connect from "connect";
import request from "supertest";
import type { IncomingMessage, ServerResponse } from "node:http";

import clearSiteData = require(".");

const ALLOWLIST = ["cache", "cookies", "executionContexts", "storage", "*"];

function app(middleware: ReturnType<typeof clearSiteData>) {
  const result = connect();
  result.use(middleware);
  result.use((_req: IncomingMessage, res: ServerResponse) => {
    res.end("Hello world!");
  });
  return result;
}

test('sets the header to "*" when passed no arguments', async () => {
  await request(app(clearSiteData())).get("/").expect("Clear-Site-Data", '"*"');
});

test('sets the header to "*" when passed an empty object', async () => {
  await request(app(clearSiteData({})))
    .get("/")
    .expect("Clear-Site-Data", '"*"');
});

ALLOWLIST.forEach((directive) => {
  test(`can set just one value, ${directive}`, async () => {
    const expectedHeaderValue = `"${directive}"`;
    await request(app(clearSiteData({ directives: [directive] })))
      .get("/")
      .expect("Clear-Site-Data", expectedHeaderValue);
  });
});

test("can set all the header values (other than *)", async () => {
  const directives = ALLOWLIST.filter((directive) => directive !== "*").sort();

  const response = await request(app(clearSiteData({ directives }))).get("/");
  const responseDirectives = response
    .get("Clear-Site-Data")
    .split(/,\s*/g)
    .map((quoted) => quoted.replace(/"/g, ""));

  assert.deepEqual(new Set(responseDirectives), new Set(directives));
});

test("throws an error when given no directives", () => {
  assert.throws(() => {
    clearSiteData({ directives: [] });
  });
});

test("throws an error when given an invalid directive", () => {
  assert.throws(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearSiteData({ directives: ["cache", "garbage"] as any[] });
  });
});

test("throws an error when duplicates are provided", () => {
  assert.throws(
    clearSiteData.bind(null, {
      directives: ["cache", "cookies", "cache"],
    }),
  );
});

test("throws an error when * is provided and other values are also provided", () => {
  assert.throws(
    clearSiteData.bind(null, {
      directives: ["*", "cookies"],
    }),
  );
  assert.throws(
    clearSiteData.bind(null, {
      directives: ["cookies", "*"],
    }),
  );
  assert.throws(
    clearSiteData.bind(null, {
      directives: ["*", "*"],
    }),
  );
});

test("throws an error when given a non-array type", () => {
  assert.throws(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearSiteData({ directives: "cache" } as any);
  });
});

test("names its function and middleware", () => {
  assert.equal(clearSiteData.name, "clearSiteData");
  assert.equal(clearSiteData().name, "clearSiteData");
});
