"""
Step 4: Train chord classification models with hyperparameter tuning.
Uses chroma-focused features (36) with augmented dataset (~2160 samples).
"""
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
import joblib

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'outputs')
FEATURES_PATH = os.path.join(OUTPUT_DIR, 'features.csv')


def main():
    print("=" * 60)
    print("MODEL TRAINING")
    print("=" * 60)

    # 1. Load features
    df = pd.read_csv(FEATURES_PATH)
    X = df.drop(columns=['chord_label']).values
    y = df['chord_label'].values
    n_features = X.shape[1]
    n_classes = len(np.unique(y))
    print(f"\nDataset: {X.shape[0]} samples, {n_features} features, {n_classes} classes")

    # 2. Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    joblib.dump(le, os.path.join(OUTPUT_DIR, 'label_encoder.joblib'))
    print(f"Label encoder saved ({n_classes} classes)")

    # 3. Cross-validation first (more reliable with small per-class counts)
    print(f"\n--- 5-Fold Cross-Validation ---")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    models_cv = {
        'Random Forest': RandomForestClassifier(
            n_estimators=500, random_state=42, n_jobs=-1, max_features='sqrt'
        ),
        'Extra Trees': ExtraTreesClassifier(
            n_estimators=500, random_state=42, n_jobs=-1
        ),
        'SVM (RBF)': SVC(kernel='rbf', C=10, gamma='scale', random_state=42),
    }

    cv_results = {}
    for name, model in models_cv.items():
        pipe = Pipeline([('scaler', StandardScaler()), ('clf', model)])
        scores = cross_val_score(pipe, X, y_encoded, cv=cv, scoring='accuracy')
        cv_results[name] = scores
        print(f"  {name}: {scores.mean():.4f} (+/- {scores.std():.4f}) | folds: {scores}")

    # 4. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"\nTrain: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")

    # 5. Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    joblib.dump(scaler, os.path.join(OUTPUT_DIR, 'scaler.joblib'))
    print("Scaler saved\n")

    # 6. Train and evaluate
    models = {
        'Random Forest': RandomForestClassifier(
            n_estimators=500, random_state=42, n_jobs=-1, max_features='sqrt'
        ),
        'Extra Trees': ExtraTreesClassifier(
            n_estimators=500, random_state=42, n_jobs=-1
        ),
        'SVM (RBF)': SVC(kernel='rbf', C=10, gamma='scale', random_state=42),
    }

    results = {}
    best_model = None
    best_accuracy = 0
    best_name = ''

    for name, model in models.items():
        print(f"--- Training: {name} ---")
        model.fit(X_train_scaled, y_train)

        train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
        test_acc = accuracy_score(y_test, model.predict(X_test_scaled))

        print(f"  Train accuracy: {train_acc:.4f}")
        print(f"  Test accuracy:  {test_acc:.4f}")
        report = classification_report(
            y_test, model.predict(X_test_scaled),
            target_names=le.classes_, zero_division=0
        )
        print(f"\n  Classification Report:")
        print(report)

        results[name] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'cv_mean': cv_results[name].mean(),
            'cv_std': cv_results[name].std(),
            'report': report
        }

        if test_acc > best_accuracy:
            best_accuracy = test_acc
            best_model = model
            best_name = name

    # 7. Save best model
    print(f"\n{'=' * 60}")
    print(f"BEST MODEL: {best_name}")
    print(f"  Test accuracy: {best_accuracy:.4f}")
    print(f"  CV accuracy:   {results[best_name]['cv_mean']:.4f} (+/- {results[best_name]['cv_std']:.4f})")
    print(f"{'=' * 60}")

    joblib.dump(best_model, os.path.join(OUTPUT_DIR, 'best_model.joblib'))
    print(f"Best model saved to outputs/best_model.joblib")

    # Also save RF model separately for JSON tree export (browser inference)
    if best_name != 'Random Forest':
        rf_model = models['Random Forest']
        joblib.dump(rf_model, os.path.join(OUTPUT_DIR, 'rf_model.joblib'))
        print(f"RF model saved to outputs/rf_model.joblib (for JSON export, acc={results['Random Forest']['test_accuracy']:.4f})")

    # 8. Save training results summary
    summary_path = os.path.join(OUTPUT_DIR, 'training_results.txt')
    with open(summary_path, 'w') as f:
        f.write("CHORD CLASSIFICATION - TRAINING RESULTS\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Dataset: {X.shape[0]} samples, {n_features} features, {n_classes} classes\n")
        f.write(f"Train/Test split: {X_train.shape[0]}/{X_test.shape[0]} (80/20)\n\n")

        for name, res in results.items():
            f.write(f"--- {name} ---\n")
            f.write(f"Train accuracy: {res['train_accuracy']:.4f}\n")
            f.write(f"Test accuracy:  {res['test_accuracy']:.4f}\n")
            f.write(f"CV accuracy:    {res['cv_mean']:.4f} (+/- {res['cv_std']:.4f})\n\n")
            f.write(f"Classification Report:\n{res['report']}\n\n")

        f.write(f"{'=' * 60}\n")
        f.write(f"BEST MODEL: {best_name}\n")
        f.write(f"Test accuracy: {best_accuracy:.4f}\n")
        f.write(f"CV accuracy: {results[best_name]['cv_mean']:.4f}\n")

    print(f"Training summary saved to {summary_path}")

    print("\n" + "=" * 60)
    print("MODEL TRAINING COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
