import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";
import { Dialog } from "./dialog";
import { RadioGroup } from "./radio-group";

const noop = () => undefined;

describe("Dialog", () => {
  it("is named by its title", () => {
    const html = renderToStaticMarkup(
      <Dialog open onClose={noop} title="Settings">
        Body
      </Dialog>,
    );
    const labelledBy = /<dialog[^>]* aria-labelledby="([^"]+)"/.exec(html)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(html).toMatch(new RegExp(`<h2 [^>]*id="${labelledBy}"[^>]*>Settings</h2>`));
  });

  it("is described by its description, when it has one", () => {
    const html = renderToStaticMarkup(<Dialog open onClose={noop} title="Settings" description="Careful" />);
    const describedBy = /<dialog[^>]* aria-describedby="([^"]+)"/.exec(html)?.[1];
    expect(describedBy).toBeTruthy();
    expect(html).toMatch(new RegExp(`<div id="${describedBy}"[^>]*>Careful</div>`));
  });

  it("has no description reference without a description", () => {
    const html = renderToStaticMarkup(<Dialog open onClose={noop} title="Settings" />);
    expect(html).not.toMatch(/ aria-describedby=/);
  });

  it("renders the body and the footer only when they are given", () => {
    const empty = renderToStaticMarkup(<Dialog open onClose={noop} title="Settings" />);
    expect(empty).not.toContain("overflow-y-auto");
    expect(empty).not.toContain("border-t");

    const full = renderToStaticMarkup(
      <Dialog open onClose={noop} title="Settings" footer={<button>Close</button>}>
        Body
      </Dialog>,
    );
    expect(full).toContain(">Body</div>");
    expect(full).toContain("<button>Close</button>");
  });

  it("keeps a closed dialog hidden: it only becomes flex while open", () => {
    const html = renderToStaticMarkup(<Dialog open={false} onClose={vi.fn()} title="Settings" />);
    expect(html).toContain("open:flex");
    expect(html).not.toMatch(/class="[^"]*(^|\s)flex(\s|")/);
  });
});

describe("ConfirmDialog", () => {
  const render = (busy?: boolean) =>
    renderToStaticMarkup(
      <ConfirmDialog
        open
        title="Delete?"
        confirmLabel="Delete"
        cancelLabel="Keep"
        busy={busy}
        onConfirm={noop}
        onCancel={noop}
      >
        <p>This cannot be undone.</p>
      </ConfirmDialog>,
    );

  it("shows the title, the explanation and both labels", () => {
    const html = render();
    expect(html).toContain("Delete?");
    expect(html).toContain("This cannot be undone.");
    expect(html).toMatch(/<button[^>]*>Keep<\/button>/);
    expect(html).toMatch(/<button[^>]*>Delete<\/button>/);
  });

  it("focuses cancel first, so that Enter does not confirm", () => {
    expect(render()).toMatch(/<button[^>]*autofocus=""[^>]*>Keep<\/button>/);
    expect(render()).not.toMatch(/<button[^>]*autofocus=""[^>]*>Delete<\/button>/);
  });

  it("disables the confirm button while busy, but not cancel", () => {
    const busy = render(true);
    expect(busy).toMatch(/<button[^>]*disabled=""[^>]*>Delete<\/button>/);
    expect(busy).not.toMatch(/<button[^>]*disabled=""[^>]*>Keep<\/button>/);
  });

  it("enables the confirm button when it is not busy", () => {
    expect(render()).not.toMatch(/ disabled=/);
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  const html = renderToStaticMarkup(
    <RadioGroup legend="Theme" name="theme" options={options} value="dark" onChange={noop} />,
  );

  it("is a fieldset named by its legend", () => {
    expect(html).toMatch(/^<fieldset><legend[^>]*>Theme<\/legend>/);
  });

  it("renders one radio per option, sharing the name", () => {
    expect(html.match(/<input type="radio"/g)).toHaveLength(2);
    expect(html.match(/name="theme"/g)).toHaveLength(2);
  });

  it("checks only the option that is the value", () => {
    const radios = [...html.matchAll(/<input[^>]*>/g)].map((m) => m[0]);
    const checked = radios.filter((radio) => radio.includes('checked=""'));
    expect(checked).toHaveLength(1);
    expect(checked[0]).toContain('value="dark"');
  });
});
