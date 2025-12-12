import { useState } from 'react'
import './App.css'

const FIELDS = {
  size: [
    { id: 'radius_mean', label: 'Radius (Mean)', placeholder: '14.13' },
    { id: 'perimeter_mean', label: 'Perimeter (Mean)', placeholder: '91.97' },
    { id: 'area_mean', label: 'Area (Mean)', placeholder: '654.89' },
  ],
  shape: [
    { id: 'smoothness_mean', label: 'Smoothness (Mean)', placeholder: '0.0964' },
    { id: 'compactness_mean', label: 'Compactness (Mean)', placeholder: '0.1041' },
    { id: 'concavity_mean', label: 'Concavity (Mean)', placeholder: '0.0869' },
    { id: 'concave_points_mean', label: 'Concave Points (Mean)', placeholder: '0.0489' },
  ],
  texture: [
    { id: 'texture_mean', label: 'Texture (Mean)', placeholder: '19.29' },
    { id: 'symmetry_mean', label: 'Symmetry (Mean)', placeholder: '0.1812' },
    { id: 'fractal_dimension_mean', label: 'Fractal Dimension (Mean)', placeholder: '0.0628' },
  ],
}

const allFields = [...FIELDS.size, ...FIELDS.shape, ...FIELDS.texture]

const API_URL = 'http://127.0.0.1:8000'

// Icons
const RulerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
)

const ShapeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
  </svg>
)

const TextureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const SECTION_ICONS = {
  size: RulerIcon,
  shape: ShapeIcon,
  texture: TextureIcon,
}

function App() {
  const [values, setValues] = useState(() =>
    allFields.reduce((acc, f) => ({ ...acc, [f.id]: '' }), {})
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (id) => (e) => {
    setValues((prev) => ({ ...prev, [id]: e.target.value }))
    setResult(null)
    setError(null)
  }

  const handleReset = () => {
    setValues(allFields.reduce((acc, f) => ({ ...acc, [f.id]: '' }), {}))
    setResult(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // Convert string values to floats
    const data = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, parseFloat(v)])
    )

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const resultData = await response.json()
      setResult(resultData)
    } catch (err) {
      setError('Failed to get prediction. Make sure the backend server is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderSection = (key, title, fields) => {
    const Icon = SECTION_ICONS[key]
    return (
      <div className="form-section" key={key}>
        <div className="section-header">
          <div className="section-icon">
            <Icon />
          </div>
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="field-grid">
          {fields.map((f) => (
            <div key={f.id} className="field">
              <label htmlFor={f.id} className="field-label">
                {f.label}
              </label>
              <input
                type="number"
                id={f.id}
                name={f.id}
                className="field-input"
                placeholder={f.placeholder}
                value={values[f.id]}
                onChange={handleChange(f.id)}
                step="any"
                required
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Breast Cancer Detection</h1>
          <p>Enter cell nucleus measurements from FNA biopsy analysis</p>
        </header>

        <form onSubmit={handleSubmit} className="card">
          {renderSection('size', 'Size Measurements', FIELDS.size)}
          {renderSection('shape', 'Shape Measurements', FIELDS.shape)}
          {renderSection('texture', 'Texture & Other', FIELDS.texture)}

          <div className="form-actions">
            <span className="required-note">All fields are required</span>
            <div className="btn-group">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Clear
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </div>
        </form>

        {/* Result Display */}
        {result && (
          <div className={`result-card ${result.prediction === 1 ? 'result-malignant' : 'result-benign'}`}>
            <div className="result-header">
              <span className="result-label">Prediction Result</span>
            </div>
            <div className="result-body">
              <span className="result-value">{result.result}</span>
              <p className="result-message">{result.message}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-card">
            <p>{error}</p>
          </div>
        )}

        <footer className="footer">
          <p>This tool is intended for research and educational purposes only. Always consult a qualified healthcare professional for medical diagnosis.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
