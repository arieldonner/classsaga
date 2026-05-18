import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import "./StudentBattle.css";

export default function StudentBattle() {
    const [battleStatus, setBattleStatus] = useState(null);
    const [pet, setPet] = useState(null);
    const [battleResult, setBattleResult] = useState(null);
    const [animatingRound, setAnimatingRound] = useState(null);
    const [displayedLog, setDisplayedLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [battling, setBattling] = useState(false);
    const [petAttacking, setPetAttacking] = useState(false);
    const [monsterAttacking, setMonsterAttacking] = useState(false);
    const [error, setError] = useState("");

    const fetchStatus = async () => {
        try {
            const [statusRes, petRes] = await Promise.all([
                api.get("/api/battle/status"),
                api.get("/api/pets/my-pet"),
            ]);
            setBattleStatus(statusRes.data);
            setPet(petRes.data);
        } catch (err) {
            setError("Failed to load battle.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleAttack = async () => {
        setBattling(true);
        setError("");
        setBattleResult(null);
        setDisplayedLog([]);
        setAnimatingRound(null);

        try {
            const res = await api.post("/api/battle/attack");
            const data = res.data;

            // Animate through rounds
            let i = 0;
            const stepRound = () => {
                if (i >= data.rounds.length) {
                    setBattleResult(data);
                    setAnimatingRound(null);
                    setPetAttacking(false);
                    setMonsterAttacking(false);
                    fetchStatus();
                    setBattling(false);
                    return;
                }
                const round = data.rounds[i];
                setAnimatingRound(round);
                setDisplayedLog(prev => [...prev, ...round.lines]);

                setPetAttacking(true);
                setTimeout(() => {
                    setPetAttacking(false);
                    if (round.lines.length > 1) {
                        setMonsterAttacking(true);
                        setTimeout(() => setMonsterAttacking(false), 350);
                    }
                }, 350);

                i++;
                setTimeout(stepRound, 900);
            };
            stepRound();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to process battle.");
            setBattling(false);
        }
    };

    const hpPercent = (current, max) => Math.max(0, Math.round((current / max) * 100));

    const hpColor = (percent) => {
        if (percent > 50) return "#4a9e6b";
        if (percent > 25) return "#c8922a";
        return "#c0392b";
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Battle</h2>
                <Link to="/student" className="btn btn-outline-secondary">
                    Back to Dashboard
                </Link>
            </div>

            {loading && <p>Loading battle...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && battleStatus && pet && (
                <div className="row g-4">
                    {/* Left - col-md-8 */}
                    <div className="col-md-8">
                        {/* Battle Scene + Controls Card */}
                        <div className="card shadow-sm p-4 mb-4">
                            <div className="d-flex justify-content-center gap-3 align-items-start" style={{ minHeight: "200px" }}>
                                {/* Pet - Left */}
                                <div style={{ width: "45%" }}>
                                    <div className="fw-bold mb-1">{pet.name}</div>
                                    <div className="small text-muted mb-1">
                                        HP {animatingRound ? animatingRound.petHP : battleResult ? battleResult.finalPetHP : battleStatus.petBattleHP}
                                    </div>
                                    <div className="progress mb-3" style={{ height: "8px" }}>
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${hpPercent(animatingRound ? animatingRound.petHP : battleResult ? battleResult.finalPetHP : battleStatus.petBattleHP, battleStatus.petBattleHP)}%`,
                                                backgroundColor: hpColor(hpPercent(animatingRound ? animatingRound.petHP : battleResult ? battleResult.finalPetHP : battleStatus.petBattleHP, battleStatus.petBattleHP))
                                            }}
                                        />
                                    </div>
                                    <div className={petAttacking ? "pet-tackle" : ""}>
                                        <div style={{ transform: "scaleX(-1)", display: "inline-block" }}>
                                            <img
                                                src={`/assets/pets/${pet.species}.png`}
                                                alt={pet.name}
                                                className="battle-breathe"
                                                style={{ maxHeight: "160px", objectFit: "contain" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Monster - Right */}
                                <div style={{ width: "45%", textAlign: "right" }}>
                                    <div className="fw-bold mb-1">{battleStatus.monster.name}</div>
                                    <div className="small text-muted mb-1">
                                        HP {animatingRound ? animatingRound.monsterHP : battleResult ? battleResult.finalMonsterHP : battleStatus.monster.currentHP}
                                    </div>
                                    <div className="progress mb-3" style={{ height: "8px" }}>
                                        <div
                                            className="progress-bar bg-danger"
                                            style={{ width: `${hpPercent(animatingRound ? animatingRound.monsterHP : battleResult ? battleResult.finalMonsterHP : battleStatus.monster.currentHP, battleStatus.monster.maxHP)}%` }}
                                        />
                                    </div>
                                    <div className={monsterAttacking ? "monster-hit" : ""}>
                                        <img
                                            src={battleStatus.monster.imageKey}
                                            alt={battleStatus.monster.name}
                                            className="battle-breathe"
                                            style={{ maxHeight: "160px", objectFit: "contain" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Controls */}
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-semibold me-2">Daily Battle:</span>
                                    {battleStatus.dailyBattleUsed
                                        ? <span className="text-muted">Used — come back tomorrow</span>
                                        : <span className="text-success">Available (Free)</span>
                                    }
                                </div>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleAttack}
                                    disabled={battleStatus.dailyBattleUsed || battling}
                                >
                                    {battling ? "Battling..." : battleStatus.dailyBattleUsed ? "Battled Today" : "Attack!"}
                                </button>
                            </div>
                        </div>

                        {/* Stats Row - nested inside col-md-8 */}
                        <div className="row g-4">
                            <div className="col-6">
                                <div className="card shadow-sm p-4">
                                    <h5 className="mb-3">Your Pet's Battle Stats</h5>
                                    <div className="d-flex gap-4">
                                        <div><span className="fw-semibold">STR:</span> {pet.strength}</div>
                                        <div><span className="fw-semibold">SPD:</span> {pet.speed}</div>
                                        <div><span className="fw-semibold">DEF:</span> {pet.defense}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card shadow-sm p-4">
                                    <h5 className="mb-3">Monster Stats</h5>
                                    <div className="d-flex gap-4">
                                        <div><span className="fw-semibold">ATK:</span> {battleStatus.monster.attack}</div>
                                        <div><span className="fw-semibold">DEF:</span> {battleStatus.monster.defense}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Battle Log col-md-4 */}
                    <div className="col-md-4">
                        <div className="card shadow-sm p-4 h-100">
                            <h5 className="mb-2">Battle Log</h5>
                            {!battleResult && !animatingRound ? (
                                <p className="text-muted mb-0">
                                    {battleStatus.dailyBattleUsed
                                        ? "You have already battled today. Come back tomorrow!"
                                        : "Press Attack to start the battle!"}
                                </p>
                            ) : (
                                <>
                                    {battleResult && (
                                        <div className={`alert ${battleResult.petWon ? "alert-success" : "alert-danger"} mb-3`}>
                                            {battleResult.petWon ? "Victory! Monster defeated!" : "Defeated! Try again tomorrow."}
                                        </div>
                                    )}
                                    <ul className="list-unstyled mb-0" style={{ maxHeight: "220px", overflowY: "auto" }}>
                                        {displayedLog.map((line, i) => (
                                            <li key={i} className="mb-1 small">{line}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
