"""
Step 6: Export the trained model to ONNX and JSON formats for frontend use.
"""
import os
import json
import numpy as np
import joblib

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'outputs')


def export_onnx(model, scaler):
    """Export to ONNX format."""
    print("\n--- ONNX Export ---")
    try:
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType

        n_features = len(scaler.mean_)
        initial_type = [('float_input', FloatTensorType([None, n_features]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type)

        onnx_path = os.path.join(OUTPUT_DIR, 'chord_classifier.onnx')
        with open(onnx_path, 'wb') as f:
            f.write(onnx_model.SerializeToString())

        size_kb = os.path.getsize(onnx_path) / 1024
        print(f"  ONNX export successful, file size: {size_kb:.1f} KB")
    except Exception as e:
        print(f"  ONNX export failed: {e}")
        print("  Continuing with JSON export...")


def export_json_random_forest(model, le, scaler):
    """Export Random Forest to compact JSON for pure JS inference."""
    print("\n--- JSON Export (Random Forest) ---")

    feature_names = (
        [f'chroma_stft_{i+1}' for i in range(12)] +
        [f'chroma_stft_std_{i+1}' for i in range(12)] +
        [f'chroma_stft_max_{i+1}' for i in range(12)]
    )

    def tree_to_arrays(tree):
        """Convert tree to compact parallel arrays (much smaller than nested dicts)."""
        t = tree.tree_
        n = t.node_count
        # For leaf nodes, store only the predicted class (argmax) instead of full distribution
        leaf_class = []
        for i in range(n):
            if t.feature[i] < 0:
                leaf_class.append(int(np.argmax(t.value[i][0])))
            else:
                leaf_class.append(-1)

        return {
            'f': t.feature[:n].tolist(),           # feature index (-2 for leaves)
            't': [round(float(x), 6) for x in t.threshold[:n]],  # thresholds
            'l': t.children_left[:n].tolist(),      # left child indices
            'r': t.children_right[:n].tolist(),     # right child indices
            'c': leaf_class                          # predicted class for leaves
        }

    model_data = {
        'model_type': 'RandomForest',
        'n_estimators': len(model.estimators_),
        'n_classes': len(le.classes_),
        'classes': le.classes_.tolist(),
        'feature_names': feature_names,
        'trees': [tree_to_arrays(est) for est in model.estimators_]
    }

    json_path = os.path.join(OUTPUT_DIR, 'chord_classifier.json')
    with open(json_path, 'w') as f:
        json.dump(model_data, f)

    size_kb = os.path.getsize(json_path) / 1024
    print(f"  Model JSON saved: {size_kb:.1f} KB ({len(model.estimators_)} trees)")

    # Export scaler parameters
    scaler_data = {
        'mean': scaler.mean_.tolist(),
        'scale': scaler.scale_.tolist(),
        'feature_names': feature_names
    }

    scaler_path = os.path.join(OUTPUT_DIR, 'scaler_params.json')
    with open(scaler_path, 'w') as f:
        json.dump(scaler_data, f)

    size_kb = os.path.getsize(scaler_path) / 1024
    print(f"  Scaler JSON saved: {size_kb:.1f} KB")


def export_json_generic(model, le, scaler):
    """Fallback: export predictions lookup for non-RF models."""
    print("\n--- JSON Export (Generic Model) ---")
    print("  Best model is not Random Forest — exporting scaler params only.")
    print("  ONNX export is the primary method for non-RF models.")

    feature_names = (
        [f'chroma_stft_{i+1}' for i in range(12)] +
        [f'chroma_stft_std_{i+1}' for i in range(12)] +
        [f'chroma_stft_max_{i+1}' for i in range(12)]
    )

    scaler_data = {
        'mean': scaler.mean_.tolist(),
        'scale': scaler.scale_.tolist(),
        'feature_names': feature_names,
        'classes': le.classes_.tolist()
    }

    scaler_path = os.path.join(OUTPUT_DIR, 'scaler_params.json')
    with open(scaler_path, 'w') as f:
        json.dump(scaler_data, f)

    size_kb = os.path.getsize(scaler_path) / 1024
    print(f"  Scaler JSON saved: {size_kb:.1f} KB")


def main():
    print("=" * 60)
    print("MODEL EXPORT")
    print("=" * 60)

    # Load artifacts
    model = joblib.load(os.path.join(OUTPUT_DIR, 'best_model.joblib'))
    scaler = joblib.load(os.path.join(OUTPUT_DIR, 'scaler.joblib'))
    le = joblib.load(os.path.join(OUTPUT_DIR, 'label_encoder.joblib'))

    model_type = type(model).__name__
    print(f"\nBest model type: {model_type}")

    # ONNX export (always attempt)
    export_onnx(model, scaler)

    # JSON export: use RF model (either best or separately saved)
    if model_type == 'RandomForestClassifier':
        export_json_random_forest(model, le, scaler)
    else:
        # Try loading separately saved RF model for JSON tree export
        rf_path = os.path.join(OUTPUT_DIR, 'rf_model.joblib')
        if os.path.exists(rf_path):
            rf_model = joblib.load(rf_path)
            print(f"\n  Using separately saved RF model for JSON export")
            export_json_random_forest(rf_model, le, scaler)
        else:
            export_json_generic(model, le, scaler)

    print("\n" + "=" * 60)
    print("EXPORT COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
