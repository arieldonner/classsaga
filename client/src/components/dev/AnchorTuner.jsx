import { useEffect, useRef, useState } from "react";

export default function AnchorTuner({ anchors, species, onVisibilityChange, accessories = [] }) {
    const boxRef = useRef(null);
    const [visible, setVisible] = useState(() => localStorage.getItem("showAnchors") === "1");
    const [showDots, setShowDots] = useState(() => localStorage.getItem("showAnchorDots") !== "0");
    const [dragKey, setDragKey] = useState(null);
    const [values, setValues] = useState(anchors ?? null);
    const [accs, setAccs] = useState({});
    const [selected, setSelected] = useState(null);

    const valuesRef = useRef(values);
    const accsRef = useRef(accs);
    useEffect(() => { valuesRef.current = values; }, [values]);
    useEffect(() => { accsRef.current = accs; }, [accs]);
    useEffect(() => { setValues(anchors ?? null); }, [anchors]);
    useEffect(() => { onVisibilityChange?.(visible); }, [visible, onVisibilityChange]);

    const signature = accessories.map((a) => `${a.slot}:${a.name}`).join("|");

    useEffect(() => {
        const next = {};
        accessories.forEach((a) => { next[a.slot] = { ...a.start }; });
        setAccs(next);
        setSelected(accessories[0]?.slot ?? null);
    }, [species, signature]);

    const logAcc = (slot, v) => {
        if (!v) return;
        const entry = accessories.find((a) => a.slot === slot);
        const flip = v.flipX ? ", flipX: true" : "";
        console.log(`${species} → "${entry?.name}": { ${slot}: { x: "${v.x}", y: "${v.y}", width: "${v.width}"${flip} } },`);
    };

    useEffect(() => {
        const onKey = (e) => {
            if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

            if (e.key === "~") {
                setShowDots((v) => {
                    localStorage.setItem("showAnchorDots", v ? "0" : "1");
                    return !v;
                });
                return;
            }

            if (e.key !== "`") return;

            setVisible((v) => {
                localStorage.setItem("showAnchors", v ? "0" : "1");
                return !v;
            });
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (!dragKey) return;

        const onMove = (e) => {
            const r = boxRef.current?.getBoundingClientRect();
            if (!r) return;
            const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%";
            const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%";

            if (dragKey.startsWith("acc:")) {
                const slot = dragKey.slice(4);
                setAccs((m) => ({ ...m, [slot]: { ...m[slot], x, y } }));
            } else {
                const slot = dragKey.slice(7);
                setValues((v) => ({ ...v, [slot]: { x, y } }));
            }
        };

        const onUp = () => {
            if (dragKey.startsWith("acc:")) {
                const slot = dragKey.slice(4);
                logAcc(slot, accsRef.current[slot]);
            } else {
                console.log(species, JSON.stringify(valuesRef.current));
            }
            setDragKey(null);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [dragKey, species, signature]);

    if (!import.meta.env.DEV || !visible || !values) return null;

    const sel = selected ? accs[selected] : null;
    const selEntry = accessories.find((a) => a.slot === selected);

    return (
        <div ref={boxRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
            {accessories.map((a) => {
                const v = accs[a.slot];
                if (!v) return null;
                return (
                    <img
                        key={a.slot}
                        src={a.imageKey}
                        alt=""
                        draggable={false}
                        onMouseDown={(e) => { e.preventDefault(); setSelected(a.slot); setDragKey(`acc:${a.slot}`); }}
                        style={{
                            position: "absolute",
                            left: v.x, top: v.y, width: v.width,
                            translate: "-50% -50%",
                            transform: v.flipX ? "scaleX(-1)" : undefined,
                            cursor: "grab",
                            pointerEvents: "auto",
                            zIndex: 2,
                            outline: selected === a.slot ? "1px dashed lime" : "1px dashed rgba(255,255,255,.5)",
                        }}
                    />
                );
            })}

            {showDots && Object.entries(values).map(([slot, a]) => (
                <div key={slot} style={{ position: "absolute", left: a.x, top: a.y, translate: "-50% -50%" }}>
                    <div
                        onMouseDown={(e) => { e.preventDefault(); setDragKey(`anchor:${slot}`); }}
                        style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: dragKey === `anchor:${slot}` ? "lime" : "red",
                            outline: "1px solid white",
                            cursor: "grab", pointerEvents: "auto",
                        }}
                    />
                    <span style={{
                        position: "absolute", left: 12, top: -5,
                        fontSize: 10, color: "#fff",
                        background: "rgba(0,0,0,.6)", padding: "0 3px", borderRadius: 3,
                        whiteSpace: "nowrap", pointerEvents: "none",
                    }}>{slot}</span>
                </div>
            ))}

            {sel && selEntry && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, marginTop: 6,
                    pointerEvents: "auto",
                    background: "rgba(0,0,0,.75)", color: "#fff",
                    fontSize: 11, padding: "4px 8px", borderRadius: 4, whiteSpace: "nowrap",
                }}>
                    {selEntry.name} · {selected} · {sel.width}
                    <input
                        type="range" min="2" max="80" step="0.5"
                        value={parseFloat(sel.width) || 20}
                        onChange={(e) => setAccs((m) => ({ ...m, [selected]: { ...m[selected], width: e.target.value + "%" } }))}
                        onMouseUp={() => logAcc(selected, accsRef.current[selected])}
                        style={{ display: "block", width: 160 }}
                    />
                    <label style={{ display: "block", marginTop: 4 }}>
                        <input
                            type="checkbox"
                            checked={!!sel.flipX}
                            onChange={(e) => {
                                const next = { ...accsRef.current[selected], flipX: e.target.checked };
                                setAccs((m) => ({ ...m, [selected]: next }));
                                logAcc(selected, next);
                            }}
                        />{" "}
                        flip
                    </label>
                </div>
            )}
        </div>
    );
}
