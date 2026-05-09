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

    const petImages = {
        wolfy: wolfyImage,
        pengu: penguImage,
        snazake: snazakeImage,
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
                    Pick your first companion. You can collect more pets later.
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
                                    className={`card shadow-sm p-4 w-100 h-100 text-center ${
                                        selectedSpecies === pet.species
                                            ? "border-primary border-3"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedSpecies(pet.species)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div
                                        className="bg-light rounded d-flex align-items-center justify-content-center mb-3"
                                        style={{ minHeight: "220px" }}
                                    >
                                        <img
                                            src={petImages[pet.species]}
                                            alt={pet.name}
                                            className="img-fluid"
                                            style={{ maxHeight: "200px" }}
                                        />
                                    </div>

                                    <h4>{pet.name}</h4>
                                </button>
                            </div>
                        ))}
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