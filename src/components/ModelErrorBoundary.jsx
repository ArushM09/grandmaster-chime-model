import { Component } from 'react'

class ModelErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="model-error" role="alert">
          <span>Model failed to load</span>
          <strong>{this.state.error.message}</strong>
          <p>
            Confirm that public/models/grandmaster_chime.glb exists, or run npm
            run generate:fallback-model.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ModelErrorBoundary
