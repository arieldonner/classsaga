import { useEffect, useRef, useState } from "react";

const ACC = "__accessory";

export default function AnchorTuner({ anchors, species, onVisibilityChange, accessory, accessorySlot, accessoryStart }) {
    const boxRef = useRef(null);
    const [visible, setVisible] = useState(() => localStorage.getItem("showAnchors") === "1");
    const [showDots, setShowDots] = useState(() => localStorage.getItem("showAnchorDots") !== "0");
    const [dragSlot, setDragSlot] = useState(null);
    const [values, setValues] = useState(anchors ?? null);
    const [acc, setAcc] = useState(accessoryStart ?? null);

    const valuesRef = useRef(values);
    const accRef = useRef(acc);
    useEffect(() => { valuesRef.current = values; }, [values]);
    useEffect(() => { accRef.current = acc; }, [acc]);
    useEffect(() => { setValues(anchors ?? null); }, [anchors]);
    useEffect(() => { setAcc(accessoryStart ?? null); }, [species, accessory?.name, accessorySlot]);
    useEffect(() => { onVisibilityChange?.(visible); }, [visible, onVisibilityChange]);

    const logAccessory = (a) => {
        if (!accessory || !a) return;
        console.log(`${species} → "${accessory.name}": { ${accessorySlot}: { x: "${a.x}", y: "${a.y}", width: "${a.width}" } },`);
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
        if (!dragSlot) return;

        const onMove = (e) => {
            const r = boxRef.current?.getBoundingClientRect();
            if (!r) return;
            const x = (((e.clientX - r.left) / r.width)  * 100).toFixed(1) + "%";
            const y = (((e.clientY - r.top)  / r.height) * 100).toFixed(1) + "%";
            if (dragSlot === ACC) setAcc((a) => ({ ...a, x, y }));
            else setValues((v) => ({ ...v, [dragSlot]: { x, y } }));
        };

        const onUp = () => {
            if (dragSlot === ACC) logAccessory(accRef.current);
            else console.log(species, JSON.stringify(valuesRef.current));
            setDragSlot(null);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [dragSlot, species, accessory, accessorySlot]);

    if (!import.meta.env.DEV || !visible || !values) return null;

    return (
        <div ref={boxRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
            {accessory && acc && (
                <img
                    src={accessory.imageKey}
                    alt=""
                    draggable={false}
                    onMouseDown={(e) => { e.preventDefault(); setDragSlot(ACC); }}
                    style={{
                        position: "absolute",
                        left: acc.x, top: acc.y, width: acc.width,
                        translate: "-50% -50%",
                        cursor: "grab",
                        pointerEvents: "auto",
                        zIndex: 2,
                        outline: dragSlot === ACC ? "1px dashed lime" : "1px dashed rgba(255,255,255,.6)",
                    }}
                />
            )}

            {showDots && Object.entries(values).map(([slot, a]) => (
                <div key={slot} style={{ position: "absolute", left: a.x, top: a.y, translate: "-50% -50%" }}>
                    <div
                        onMouseDown={(e) => { e.preventDefault(); setDragSlot(slot); }}
                        style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: slot === dragSlot ? "lime" : "red",
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

            {accessory && acc && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, marginTop: 6,
                    pointerEvents: "auto",
                    background: "rgba(0,0,0,.75)", color: "#fff",
                    fontSize: 11, padding: "4px 8px", borderRadius: 4, whiteSpace: "nowrap",
                }}>
                    {accessory.name} · {accessorySlot} · {acc.width}
                    <input
                        type="range" min="2" max="100" step="0.5"
                        value={parseFloat(acc.width) || 20}
                        onChange={(e) => setAcc((a) => ({ ...a, width: e.target.value + "%" }))}
                        onMouseUp={() => logAccessory(accRef.current)}
                        style={{ display: "block", width: 160 }}
                    />
                </div>
            )}
        </div>
    );
}
