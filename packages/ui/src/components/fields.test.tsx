import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Select } from "./select";
import { TextArea } from "./text-area";
import { TextInput } from "./text-input";

/** The `for` of the label and the `id` of the control it names. */
function labelTarget(html: string, control: "input" | "textarea" | "select") {
  const labelFor = /<label for="([^"]+)"/.exec(html)?.[1];
  const controlId = new RegExp(`<${control}[^>]* id="([^"]+)"`).exec(html)?.[1];
  return { labelFor, controlId };
}

describe("TextInput", () => {
  it("is labelled by its label", () => {
    const html = renderToStaticMarkup(<TextInput label="Name" />);
    const { labelFor, controlId } = labelTarget(html, "input");
    expect(labelFor).toBeTruthy();
    expect(labelFor).toBe(controlId);
    expect(html).toContain(">Name</label>");
  });

  it("keeps the label for screen readers when it is hidden", () => {
    const html = renderToStaticMarkup(<TextInput label="Name" hideLabel />);
    expect(html).toMatch(/<label[^>]*class="sr-only"[^>]*>Name<\/label>/);
  });

  it("gives every field its own id", () => {
    const html = renderToStaticMarkup(
      <>
        <TextInput label="First" />
        <TextInput label="Second" />
      </>,
    );
    const ids = [...html.matchAll(/<input[^>]* id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(2);
  });

  it("passes native attributes through", () => {
    const html = renderToStaticMarkup(<TextInput label="Name" placeholder="Ada" maxLength={20} />);
    expect(html).toContain('placeholder="Ada"');
    expect(html).toContain('maxLength="20"');
  });
});

describe("TextArea", () => {
  it("is labelled by its label", () => {
    const html = renderToStaticMarkup(<TextArea label="Notes" />);
    const { labelFor, controlId } = labelTarget(html, "textarea");
    expect(labelFor).toBeTruthy();
    expect(labelFor).toBe(controlId);
  });

  it("has no description when it has no hint and no footer", () => {
    expect(renderToStaticMarkup(<TextArea label="Notes" />)).not.toMatch(/ aria-describedby=/);
  });

  it("is described by the hint and the footer, in that order, then by the caller's value", () => {
    const html = renderToStaticMarkup(
      <TextArea label="Notes" hint="Be brief" footer="0 / 500" aria-describedby="external" />,
    );
    const describedBy = /<textarea[^>]* aria-describedby="([^"]+)"/.exec(html)?.[1].split(" ");
    expect(describedBy).toHaveLength(3);
    const [hintId, footerId, external] = describedBy ?? [];
    expect(external).toBe("external");
    expect(html).toMatch(new RegExp(`<p id="${hintId}"[^>]*>Be brief</p>`));
    expect(html).toMatch(new RegExp(`<p id="${footerId}"[^>]*>0 / 500</p>`));
  });

  it("keeps the caller's description when it has no hint or footer", () => {
    const html = renderToStaticMarkup(<TextArea label="Notes" aria-describedby="external" />);
    expect(html).toContain('aria-describedby="external"');
  });
});

describe("Select", () => {
  it("is labelled by its label and renders its options", () => {
    const html = renderToStaticMarkup(
      <Select label="Language" defaultValue="pl">
        <option value="en">English</option>
        <option value="pl">Polski</option>
      </Select>,
    );
    const { labelFor, controlId } = labelTarget(html, "select");
    expect(labelFor).toBeTruthy();
    expect(labelFor).toBe(controlId);
    expect(html).toContain('<option value="pl" selected="">Polski</option>');
  });
});
