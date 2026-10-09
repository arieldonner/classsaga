// Draw order, back to front: a hat sits over a side pin, glasses over both.
export const ACCESSORY_SLOTS = ["headSide", "headTop", "eyes"];

const addOffset = (base, delta) => {
    const d = String(delta ?? "0%").trim();
    return d.startsWith("-")
        ? `calc(${base} - ${d.slice(1)})`
        : `calc(${base} + ${d})`;
};

// Placement comes from the pet's tuned override for this item and slot, falling
// back to the slot's anchor plus the item's own art correction.
export const resolveAccessory = (item, offsets, slot) => {
    if (!item || !slot) return undefined;

    const tuned = offsets?.accessoryOverrides?.[item.name]?.[slot];

    if (tuned) {
        return {
            left: tuned.x,
            top: tuned.y,
            width: tuned.width,
            translate: "-50% -50%",
            transform: tuned.flipX ? "scaleX(-1)" : undefined,
        };
    }

    const anchor = offsets?.anchors?.[slot];
    if (!anchor) return undefined;

    return {
        left: addOffset(anchor.x, item.offsetX),
        top: addOffset(anchor.y, item.offsetY),
        width: item.accessoryWidth ?? "20%",
        translate: "-50% -50%",
    };
};

// Pets have differing amounts of transparent padding below their artwork, so
// the ground anchor says where each one actually stands inside its box.
export const groundShift = (offsets) => {
    const y = parseFloat(offsets?.anchors?.ground?.y);
    if (Number.isNaN(y)) return "0 0";
    return `0 ${(100 - y).toFixed(1)}%`;
};
