# Breast Cancer Detection

A machine learning-powered web application for breast cancer detection using cell nucleus measurements from Fine Needle Aspirate (FNA) biopsy analysis.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18-blue)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.0+-orange)

## Overview

This project uses the **Wisconsin Breast Cancer Dataset** to classify tumors as either **Malignant** (cancerous) or **Benign** (non-cancerous) based on 10 key cell nucleus features.

## Features Used

The model uses the 10 most important mean features from FNA analysis:

| Feature | Description |
|---------|-------------|
| `radius_mean` | Mean of distances from center to points on the perimeter |
| `texture_mean` | Standard deviation of gray-scale values |
| `perimeter_mean` | Mean perimeter of the cell nucleus |
| `area_mean` | Mean area of the cell nucleus |
| `smoothness_mean` | Mean local variation in radius lengths |
| `compactness_mean` | Mean of (perimeter² / area - 1.0) |
| `concavity_mean` | Mean severity of concave portions of the contour |
| `concave points_mean` | Mean number of concave portions of the contour |
| `symmetry_mean` | Mean symmetry of the cell nucleus |
| `fractal_dimension_mean` | Mean "coastline approximation" - 1 |

---

## Model Architecture

### Algorithm: Gradient Boosting Classifier

The model uses **scikit-learn's GradientBoostingClassifier** with hyperparameters tuned using **Optuna** (Bayesian optimization).

### Preprocessing Pipeline

```
ColumnTransformer
├── Log Transform (np.log1p)
│   └── High-skew columns: area_mean, compactness_mean, concavity_mean,
│       concave points_mean, fractal_dimension_mean
├── MinMax Scaler
│   └── Size columns: radius_mean, texture_mean, perimeter_mean
└── Standard Scaler
    └── Remaining columns: smoothness_mean, symmetry_mean
```

### Tuned Hyperparameters

```python
GradientBoostingClassifier(
    n_estimators=100,
    max_depth=12,
    learning_rate=0.151,
    min_samples_split=18,
    min_samples_leaf=12,
    subsample=0.567,
    max_features='sqrt',
    min_weight_fraction_leaf=0.032,
    max_leaf_nodes=27,
    min_impurity_decrease=0.069,
    ccp_alpha=1.19e-05
)
```

---

## Hyperparameter Tuning

Hyperparameters were optimized using **Optuna** with:

- **Sampler**: TPE (Tree-structured Parzen Estimator)
- **Objective**: Maximize Recall (minimize false negatives)
- **Cross-validation**: 5-fold Stratified K-Fold
- **Trials**: 150

### Parameter Search Space

| Parameter | Range |
|-----------|-------|
| n_estimators | 100 - 800 |
| max_depth | 3 - 15 |
| learning_rate | 0.001 - 0.3 (log scale) |
| min_samples_split | 2 - 30 |
| min_samples_leaf | 1 - 20 |
| subsample | 0.5 - 1.0 |
| max_features | sqrt, log2, None |
| ccp_alpha | 0.0 - 0.05 |

---

## Model Performance

| Metric | Score |
|--------|-------|
| **Cross-validation Accuracy** | 93.1% |
| **Test Recall** | 95.1% |
| **Test Accuracy** | 96.5% |

### Confusion Matrix

```
              Predicted
              B     M
Actual  B   [71     2]
        M   [ 2    39]
```

- **True Negatives**: 71 (Benign correctly identified)
- **False Positives**: 2 (Benign incorrectly flagged as Malignant)
- **False Negatives**: 2 (Malignant missed - critical to minimize)
- **True Positives**: 39 (Malignant correctly identified)

---

## Project Structure

```
Breast Cancer Detection/
├── main.py                 # FastAPI backend
├── model.pkl               # Trained GradientBoostingClassifier
├── scaler.pkl              # Fitted ColumnTransformer
├── data.csv                # Wisconsin Breast Cancer Dataset
├── model.ipynb             # Original model training notebook
├── test.ipynb              # Final model with tuning
├── breast-cancer-form/     # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main form component
│   │   ├── App.css         # Component styles
│   │   └── index.css       # Global styles
│   └── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
# Install dependencies
pip install fastapi uvicorn joblib numpy pandas scikit-learn

# Run the API server
python -m uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd breast-cancer-form

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## API Documentation

### POST /predict

Predicts whether a tumor is malignant or benign.

**Request Body:**

```json
{
  "radius_mean": 14.13,
  "texture_mean": 19.29,
  "perimeter_mean": 91.97,
  "area_mean": 654.89,
  "smoothness_mean": 0.0964,
  "compactness_mean": 0.1041,
  "concavity_mean": 0.0869,
  "concave_points_mean": 0.0489,
  "symmetry_mean": 0.1812,
  "fractal_dimension_mean": 0.0628
}
```

**Response:**

```json
{
  "prediction": 0,
  "result": "Benign",
  "message": "The tumor is classified as Benign"
}
```

### GET /health

Health check endpoint.

---

## Usage

1. Start the backend server
2. Start the frontend development server
3. Open `http://localhost:5173` in your browser
4. Enter the 10 cell nucleus measurements
5. Click "Run Analysis" to get the prediction

---

## Disclaimer

⚠️ **This tool is for research and educational purposes only.** It is not intended for clinical diagnosis. Always consult a qualified healthcare professional for medical advice and diagnosis.

---

## Dataset

[Wisconsin Breast Cancer Dataset](https://archive.ics.uci.edu/ml/datasets/Breast+Cancer+Wisconsin+(Diagnostic))

- **Instances**: 569
- **Features**: 30 (10 mean, 10 SE, 10 worst)
- **Classes**: Malignant (212), Benign (357)

---

## License

MIT License
