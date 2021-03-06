import connect from "connect";
import request from "supertest";
import { IncomingMessage, ServerResponse } from "http";

import clearSiteData = require("..");

const ALLOWLIST = ["cache", "cookies", "executionContexts", "storage", "*"];

function app(middleware: ReturnType<typeof clearSiteData>) {
  const result = connect();
  result.use(middleware);
  result.use((_req: IncomingMessage, res: ServerResponse) => {
    res.end("Hello world!");
  });
  return result;
}

describe("clearSiteData", () => {
  it('sets the header to "*" when passed no arguments', async () => {
    await request(app(clearSiteData()))
      .get("/")
      .expect("Clear-Site-Data", '"*"');
  });

  it('sets the header to "*" when passed an empty object', async () => {
    await request(app(clearSiteData({})))
      .get("/")
      .expect("Clear-Site-Data", '"*"');
  });

  ALLOWLIST.forEach((directive) => {
    it(`can set just one value, ${directive}`, async () => {
      const expectedHeaderValue = `"${directive}"`;
      await request(app(clearSiteData({ directives: [directive] })))
        .get("/")
        .expect("Clear-Site-Data", expectedHeaderValue);
    });
  });

  it("can set all the header values (other than *)", async () => {
    const directives = ALLOWLIST.filter(
      (directive) => directive !== "*"
    ).sort();

    const response = await request(app(clearSiteData({ directives }))).get("/");
    const actualDirectivesSorted = response
      .get("Clear-Site-Data")
      .split(/,\s*/g)
      .map((quoted) => quoted.replace(/"/g, ""))
      .sort();
    expect(actualDirectivesSorted).toStrictEqual(directives);
  });

  it("throws an error when given no directives", () => {
    expect(() => {
      clearSiteData({ directives: [] });
    }).toThrow();
  });

  it("throws an error when given an invalid directive", () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clearSiteData({ directives: ["cache", "garbage"] as any[] });
    }).toThrow();
  });

  it("throws an error when duplicates are provided", () => {
    expect(
      clearSiteData.bind(null, {
        directives: ["cache", "cookies", "cache"],
      })
    ).toThrow();
  });

  it("throws an error when * is provided and other values are also provided", () => {
    expect(
      clearSiteData.bind(null, {
        directives: ["*", "cookies"],
      })
    ).toThrow();
    expect(
      clearSiteData.bind(null, {
        directives: ["cookies", "*"],
      })
    ).toThrow();
    expect(
      clearSiteData.bind(null, {
        directives: ["*", "*"],
      })
    ).toThrow();
  });

  it("throws an error when given a non-array type", () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clearSiteData({ directives: "cache" } as any);
    }).toThrow();
  });

  it("names its function and middleware", () => {
    expect(clearSiteData.name).toEqual("clearSiteData");
    expect(clearSiteData().name).toEqual("clearSiteData");
  });
});
