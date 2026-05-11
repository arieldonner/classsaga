import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

import wolfyImage from "../../assets/pets/wolfy.png";
import penguImage from "../../assets/pets/Pengu.png";
import snazakeImage from "../../assets/pets/Snazake.png";

export default function ChooseStarterPet() {
    const navigate = useNavigate();

    const [starterPets, setStarterPets] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState("");
    const [loading, setLoading] = useState(true);
    const [choosing, setChoosing] = useState(false);
    const [error, setError] = useState("");
    const [petName, setPetName] = useState("");

    const petImages = {
        wolfy: wolfyImage,
        pengu: penguImage,
        snazake: snazakeImage,
    };

    const petDescriptions = {
        wolfy: "A loyal and fierce companion. Excels in strength.",
        pengu: "Cool under pressure. Quick and dependable.",
        snazake: "Mysterious and agile. Full of surprises.",
    };

    useEffect(() => {
        const fetchStarterPets = async () => {
            try {
                const res = await api.get("/api/pets/starter-options");
                setStarterPets(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load starter pets.");
            } finally {
                setLoading(false);
            }
        };

        fetchStarterPets();
    }, []);

    const handleChooseStarter = async () => {
        setError("");

        if (!selectedSpecies) {
            setError("Please choose a starter pet.");
            return;
        }

        setChoosing(true);

        try {
            await api.post("/api/pets/choose-starter", {
                species: selectedSpecies,
                name: petName,
            });

            navigate("/student/pet");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to choose starter pet.");
        } finally {
            setChoosing(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="text-center mb-4">
                <h2>Choose Your Starter Pet</h2>
                <p className="text-muted mb-0">
                    Pick your first companion and give them a name. You can collect more pets later.
                </p>
            </div>

            {loading && <p>Loading starter pets...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && (
                <>
                    <div className="row g-4 mb-4">
                        {starterPets.map((pet) => (
                            <div className="col-md-4" key={pet.species}>
                                <button
                                    type="button"
                                    className="card shadow-sm p-4 w-100 h-100 text-center"
                                    onClick={() => setSelectedSpecies(pet.species)}
                                    style={{
                                        cursor: "pointer",
                                        border: selectedSpecies === pet.species
                                            ? "3px solid var(--color-green)"
                                            : "2px solid var(--color-border)"
                                    }}
                                >
                                    <div
                                        className="rounded d-flex align-items-center justify-content-center mb-3"
                                        style={{ minHeight: "280px", backgroundColor: "var(--color-panel)" }}
                                    >
                                        <img
                                            src={petImages[pet.species]}
                                            alt={pet.name}
                                            className="img-fluid"
                                            style={{ maxHeight: "200px" }}
                                        />
                                    </div>

                                    <h4>{pet.name}</h4>
                                    <p className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
                                        {petDescriptions[pet.species]}
                                    </p>

                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex flex-column align-items-center mb-3">
                        <input
                            type="text"
                            className="form-control"
                            style={{ maxWidth: "300px" }}
                            placeholder="Name your pet..."
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            maxLength={20}
                        />
                        <small className="text-muted">Leave blank to use the default pet name.</small>
                    </div>

                    <div className="text-center">
                        <button
                            className="btn btn-primary"
                            onClick={handleChooseStarter}
                            disabled={choosing}
                        >
                            {choosing ? "Choosing..." : "Choose Starter"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}