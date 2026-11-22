/**
 * Incremental parser for a text/event-stream body. Push decoded text as it arrives and get back
 * the data payload of every complete event. Comment lines (": keep-alive") are ignored.
 */
export class SSEParser {
  private buffer = "";

  push(chunk: string): string[] {
    this.buffer = (this.buffer + chunk).replace(/\r\n?/g, "\n");
    const payloads: string[] = [];
    let end: number;
    while ((end = this.buffer.indexOf("\n\n")) !== -1) {
      const block = this.buffer.slice(0, end);
      this.buffer = this.buffer.slice(end + 2);
      const data = block
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, ""))
        .join("\n");
      if (data) payloads.push(data);
    }
    return payloads;
  }
}

/** Reads a fetch() response as server-sent events, yielding each event parsed as JSON. */
export async function* readEvents<T>(response: Response): AsyncGenerator<T> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = new SSEParser();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      for (const data of parser.push(decoder.decode(value, { stream: true }))) {
        yield JSON.parse(data) as T;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
