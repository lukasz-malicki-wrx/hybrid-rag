import { describe, expect, it } from "vitest";
import { SSEParser } from "./sse";

describe("SSEParser", () => {
  it("returns complete events and keeps partial ones for the next chunk", () => {
    const p = new SSEParser();
    expect(p.push('data: {"a":1}\n\ndata: {"b"')).toEqual(['{"a":1}']);
    expect(p.push(":2}\n\n")).toEqual(['{"b":2}']);
  });

  it("ignores keep-alive comments and handles CRLF split across chunks", () => {
    const p = new SSEParser();
    expect(p.push(": keep-alive\r\n\r")).toEqual([]);
    expect(p.push('\ndata: {"x":1}\r\n\r\n')).toEqual(['{"x":1}']);
  });
});
