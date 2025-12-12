from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler separately (as exported in test.ipynb)
model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

# Features in correct order — MUST MATCH training (from test.ipynb imp_features)
IMP_FEATURES = [
    "radius_mean",
    "texture_mean",
    "perimeter_mean",
    "area_mean",
    "smoothness_mean",
    "compactness_mean",
    "concavity_mean",
    "concave points_mean",  # Note: has space, matches the dataset column name
    "symmetry_mean",
    "fractal_dimension_mean"
]

class InputData(BaseModel):
    radius_mean: float
    texture_mean: float
    perimeter_mean: float
    area_mean: float
    smoothness_mean: float
    compactness_mean: float
    concavity_mean: float
    concave_points_mean: float  # Frontend uses underscore
    symmetry_mean: float
    fractal_dimension_mean: float

@app.post("/predict")
def predict(data: InputData):
    # Create a DataFrame with the correct column names (matching training data)
    input_dict = {
        "radius_mean": [data.radius_mean],
        "texture_mean": [data.texture_mean],
        "perimeter_mean": [data.perimeter_mean],
        "area_mean": [data.area_mean],
        "smoothness_mean": [data.smoothness_mean],
        "compactness_mean": [data.compactness_mean],
        "concavity_mean": [data.concavity_mean],
        "concave points_mean": [data.concave_points_mean],  # Note: space in column name
        "symmetry_mean": [data.symmetry_mean],
        "fractal_dimension_mean": [data.fractal_dimension_mean]
    }
    
    input_df = pd.DataFrame(input_dict)
    
    # Apply the scaler (ColumnTransformer)
    scaled_input = scaler.transform(input_df)
    
    # Predict using the model
    pred = model.predict(scaled_input)[0]
    
    result = "Malignant" if pred == 1 else "Benign"
    
    return {
        "prediction": int(pred),
        "result": result,
        "message": f"The tumor is classified as {result}"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
