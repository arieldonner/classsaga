import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

export default function StudentPet() {
  const [pet, setPet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
        try {
            const res = await api.get("/api/pets/my-pet");
            setPet(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load pet.");
        } finally {
            setLoading(false);
        }
    };

    fetchPet();
  }, []);

  return (
    <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Pet</h2>
            <Link to="/student" className="btn btn-outline-secondary">
            Back to Dashboard
            </Link>
        </div>

        {loading && <p>Loading pet...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && pet && (
            <div className="card shadow-sm p-4">
            <div className="row align-items-center">
                <div className="col-md-4 text-center mb-4 mb-md-0">
                <div
                    className="border rounded bg-light d-flex align-items-center justify-content-center"
                    style={{ minHeight: "260px" }}
                >
                    Pet image goes here
                </div>
                </div>

                <div className="col-md-8">
                <h3 className="mb-2">{pet.name}</h3>
                <p className="text-muted mb-3">
                    Species: {pet.species}
                </p>

                <p className="mb-2">
                    <strong>Level:</strong> {pet.level}
                </p>
                <p className="mb-4">
                    <strong>Experience:</strong> {pet.experience}
                </p>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Hunger</label>
                    <div className="progress">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${pet.hunger}%` }}
                        aria-valuenow={pet.hunger}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {pet.hunger}
                    </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Happiness</label>
                    <div className="progress">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${pet.happiness}%` }}
                        aria-valuenow={pet.happiness}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {pet.happiness}
                    </div>
                    </div>
                </div>

                <div className="mb-0">
                    <label className="form-label fw-semibold">Cleanliness</label>
                    <div className="progress">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${pet.cleanliness}%` }}
                        aria-valuenow={pet.cleanliness}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {pet.cleanliness}
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        )}
    </div>
  );
}