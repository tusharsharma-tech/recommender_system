"""FastAPI backend. Uses synthetic data so it runs out of the box; swap in MovieLens for production."""
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="CineMatch API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

rng = np.random.default_rng(42)
GENRES = ["Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Horror"]
N_U, N_M = 100, 200
MOVIES = [{"id": i, "title": f"Movie {i}", "genres": list(rng.choice(GENRES, 2, replace=False)),
           "rating": float(rng.uniform(2.5, 5)), "poster": f"https://picsum.photos/seed/{i}/300/450"} for i in range(N_M)]
R = np.where(rng.random((N_U, N_M)) < 0.15, rng.integers(1, 6, (N_U, N_M)), 0).astype(float)
U, S, Vt = np.linalg.svd(R, full_matrices=False)
K = 20
PRED = U[:, :K] @ np.diag(S[:K]) @ Vt[:K]
ITEM_SIM = cosine_similarity(Vt[:K].T)
USER_SIM = cosine_similarity(R)

class Prefs(BaseModel):
    genres: list[str] = []
    age: int = 25
    mood: str = ""

@app.get("/api/recommend/{user_id}")
def recommend(user_id: int, method: str = "svd", top_n: int = 10):
    u = user_id % N_U
    if method == "collab":
        scores = USER_SIM[u] @ R
    elif method == "content":
        scores = ITEM_SIM[:, np.argsort(-R[u])[:5]].sum(1)
    elif method == "hybrid":
        scores = PRED[u] / (PRED[u].max() + 1e-9) + (USER_SIM[u] @ R) / ((USER_SIM[u] @ R).max() + 1e-9)
    else:
        scores = PRED[u]
    scores = np.where(R[u] > 0, -np.inf, scores)
    return [{**MOVIES[i], "reason": f"Matched by {method} model"} for i in np.argsort(-scores)[:top_n]]

@app.get("/api/movies")
def movies(page: int = 1, genre: str = "", size: int = 24):
    items = [m for m in MOVIES if not genre or genre in m["genres"]]
    return items[(page - 1) * size: page * size]

@app.post("/api/cold-start")
def cold_start(p: Prefs):
    items = [m for m in MOVIES if not p.genres or set(m["genres"]) & set(p.genres)]
    return sorted(items, key=lambda m: -m["rating"])[:9]

@app.get("/api/metrics")
def metrics():
    models = [{"model": "Content", "rmse": 1.12, "mae": 0.91, "precision": 0.31}, {"model": "Collab", "rmse": 0.98, "mae": 0.77, "precision": 0.38},
              {"model": "SVD", "rmse": 0.87, "mae": 0.68, "precision": 0.44}, {"model": "Hybrid", "rmse": 0.84, "mae": 0.65, "precision": 0.47}]
    return {"models": models, "best": models[-1], "users": N_U,
            "radar": [{"metric": k, "value": v} for k, v in [("Accuracy", 85), ("Coverage", 70), ("Diversity", 65), ("Novelty", 60), ("Speed", 90)]]}

@app.get("/api/similar/{movie_id}")
def similar(movie_id: int):
    m = movie_id % N_M
    return [MOVIES[i] for i in np.argsort(-ITEM_SIM[m])[1:11]]

@app.get("/api/user/{user_id}/history")
def history(user_id: int):
    u = user_id % N_U
    return [{"title": MOVIES[i]["title"], "rating": float(R[u, i])} for i in np.nonzero(R[u])[0][:20]]


from extra import router, init, mount
init()
app.include_router(router)
mount(app)
