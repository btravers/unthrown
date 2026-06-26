import {
  errAsync,
  okAsync,
  ResultAsync,
  err as neverthrowErr,
  ok as neverthrowOk,
} from "neverthrow";
import { err, ok, type Result } from "unthrown";
import { describe, expect, it } from "vitest";

import { fromNeverthrow, fromNeverthrowAsync, toNeverthrow, toNeverthrowAsync } from "./index.js";

const boom = new Error("boom");
const aDefect: Result<number, string> = ok(0).map<number>(() => {
  throw boom;
});

describe("toNeverthrow", () => {
  it("maps Ok and Err across", () => {
    const okR = toNeverthrow(ok(1), () => "x");
    expect(okR.isOk() && okR.value).toBe(1);
    const errR = toNeverthrow(err("nope") as Result<number, string>, () => "x");
    expect(errR.isErr() && errR.error).toBe("nope");
  });

  it("forces a defect to be triaged into the error channel", () => {
    const r = toNeverthrow(aDefect, (cause) => `bug:${String(cause)}`);
    expect(r.isErr() && r.error).toBe(`bug:${String(boom)}`);
  });
});

describe("fromNeverthrow", () => {
  it("maps ok to Ok and err to Err — never a Defect", () => {
    expect(fromNeverthrow(neverthrowOk(1))).toMatchObject({ tag: "Ok", value: 1 });
    expect(fromNeverthrow(neverthrowErr("nope"))).toMatchObject({ tag: "Err", error: "nope" });
  });
});

describe("toNeverthrowAsync", () => {
  it("maps Ok across and triages a defect", async () => {
    const okR = await toNeverthrowAsync(ok(1).toAsync(), () => "x");
    expect(okR.isOk() && okR.value).toBe(1);
    const defR = await toNeverthrowAsync(aDefect.toAsync(), (cause) => `bug:${String(cause)}`);
    expect(defR.isErr() && defR.error).toBe(`bug:${String(boom)}`);
  });
});

describe("fromNeverthrowAsync", () => {
  it("maps okAsync/errAsync, and an unexpected rejection to a Defect", async () => {
    expect(await fromNeverthrowAsync(okAsync(1))).toMatchObject({ tag: "Ok", value: 1 });
    expect(await fromNeverthrowAsync(errAsync("nope"))).toMatchObject({
      tag: "Err",
      error: "nope",
    });
    const rejecting: ResultAsync<number, string> = ResultAsync.fromSafePromise(
      Promise.reject(boom),
    );
    expect(await fromNeverthrowAsync(rejecting)).toMatchObject({ tag: "Defect", cause: boom });
  });
});
