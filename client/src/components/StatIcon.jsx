const STATS = {
    str: { icon: "bi-fire", color: "var(--color-amber)", label: "STR" },
    spd: { icon: "bi-lightning-charge-fill", color: "var(--color-text)", label: "SPD" },
    def: { icon: "bi-shield-fill", color: "var(--color-green)", label: "DEF" },
};

export default function StatIcon({ kind }) {
    const stat = STATS[kind];

    if (!stat) return null;

    return (
        <i
            className={`bi ${stat.icon} me-1`}
            style={{ color: stat.color }}
            title={stat.label}
            aria-hidden="true"
        />
    );
}
