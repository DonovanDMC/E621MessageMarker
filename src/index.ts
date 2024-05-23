function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

async function mark(element: HTMLTableRowElement) {
    const id = Number(element.querySelector<HTMLAnchorElement>("td:nth-child(4) a")!.href.slice("https://e621.net/dmails/".length));
    await GM.setValue("markedMessages", Array.from(new Set([...await GM.getValue("markedMessages", []), id])));
    red(element);
    unmarkButton(element, element.querySelector("td:last-child")!);
}

async function unmark(element: HTMLTableRowElement) {
    const id = Number(element.querySelector<HTMLAnchorElement>("td:nth-child(4) a")!.href.slice("https://e621.net/dmails/".length));
    await GM.setValue("markedMessages", Array.from(new Set((await GM.getValue("markedMessages", [])).filter((x: number) => x !== id))));
    element.classList.remove("marked");
    element.style.backgroundColor = "";
    markButton(element, element.querySelector("td:last-child")!);
}

function red(element: HTMLTableRowElement) {
    element.classList.add("marked");
    element.style.backgroundColor = "#820000";
}

function markButton(row: HTMLTableRowElement, element: HTMLTableCellElement) {
    const unmarkLink = element.querySelector("a.unmark-button");
    if (unmarkLink !== null) {
        unmarkLink.remove();
    }
    if (element.querySelector("a.mark-button") !== null) {
        return;
    }
    const linkMark = document.createElement("a");
    linkMark.classList.add("mark-button");
    linkMark.addEventListener("click", async function(ev) {
        ev.preventDefault();
        await mark(row);
    });
    linkMark.textContent = "Mark";
    element.append(linkMark);
}

function unmarkButton(row: HTMLTableRowElement, element: HTMLTableCellElement) {
    const markLink = element.querySelector("a.mark-button");
    if (markLink !== null) {
        markLink.remove();
    }
    if (element.querySelector("a.unmark-button") !== null) {
        return;
    }
    const linkUnmark = document.createElement("a");
    linkUnmark.classList.add("unmark-button");
    linkUnmark.addEventListener("click", async function(ev) {
        ev.preventDefault();
        await unmark(row);
    });
    linkUnmark.textContent = "Unmark";
    element.append(linkUnmark);
}

document.addEventListener("DOMContentLoaded", async() => {
    const url = new URL(window.location.href);
    if (!url.pathname.endsWith("/dmails")) {
        return;
    }
    const dmailListContainer = document.querySelector("div#c-dmails");
    assert(dmailListContainer !== null, "Could not find container");

    const dmailsHead = dmailListContainer.querySelector("thead tr");
    assert(dmailsHead !== null, "Could not find dmails head");
    const actionsHeader = document.createElement("th");
    actionsHeader.textContent = "Actions";
    dmailsHead.append(actionsHeader);

    const dmailsBody = dmailListContainer.querySelector("tbody");
    assert(dmailsBody !== null, "Could not find dmails body");

    const dmails = Array.from(dmailsBody.querySelectorAll<HTMLTableRowElement>("tr"));
    for (const row of dmails) {
        const cell = row.insertCell();
        const link = row.querySelector<HTMLAnchorElement>("td:nth-child(4) a")!.href;
        const isMarked = (await GM.getValue("markedMessages", [] as Array<number>)).includes(Number(link.slice("https://e621.net/dmails/".length)));
        if (isMarked) {
            red(row);
            unmarkButton(row, cell);
        } else {
            markButton(row, cell);
        }
    }
});
