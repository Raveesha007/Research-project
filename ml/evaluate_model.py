"""
Step 5: Evaluate the best model with confusion matrix and F1 score visualizations.
"""
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix, classification_report,
    accuracy_score, f1_score
)
import joblib

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'outputs')
FEATURES_PATH = os.path.join(OUTPUT_DIR, 'features.csv')


def main():
    print("=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)

    # Load artifacts
    model = joblib.load(os.path.join(OUTPUT_DIR, 'best_model.joblib'))
    scaler = joblib.load(os.path.join(OUTPUT_DIR, 'scaler.joblib'))
    le = joblib.load(os.path.join(OUTPUT_DIR, 'label_encoder.joblib'))
    df = pd.read_csv(FEATURES_PATH)

    X = df.drop(columns=['chord_label']).values
    y = df['chord_label'].values
    y_encoded = le.transform(y)

    # Reproduce exact same split
    _, X_test, _, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)

    class_names = le.classes_

    # Overall metrics
    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    weighted_f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    print(f"\nOverall Accuracy:  {acc:.4f}")
    print(f"Macro F1 Score:    {macro_f1:.4f}")
    print(f"Weighted F1 Score: {weighted_f1:.4f}")

    # 1. Confusion Matrix
    print("\nGenerating confusion matrix...")
    cm = confusion_matrix(y_test, y_pred)

    fig, ax = plt.subplots(figsize=(14, 12))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues',
        xticklabels=class_names, yticklabels=class_names,
        ax=ax, cbar_kws={'label': 'Count'}
    )
    ax.set_xlabel('Predicted Chord', fontsize=12)
    ax.set_ylabel('Actual Chord', fontsize=12)
    ax.set_title('Chord Classification - Confusion Matrix', fontsize=14)
    plt.xticks(rotation=45, ha='right', fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.tight_layout()
    cm_path = os.path.join(OUTPUT_DIR, 'confusion_matrix.png')
    plt.savefig(cm_path, dpi=150)
    plt.close()
    print(f"  Saved: {cm_path}")

    # 2. Per-class F1 Bar Chart
    print("Generating F1 score chart...")
    report = classification_report(
        y_test, y_pred, target_names=class_names,
        output_dict=True, zero_division=0
    )
    f1_scores = {name: report[name]['f1-score'] for name in class_names}

    fig, ax = plt.subplots(figsize=(14, 6))
    bars = ax.bar(f1_scores.keys(), f1_scores.values(), color='steelblue', edgecolor='navy')
    ax.set_xlabel('Chord Class', fontsize=12)
    ax.set_ylabel('F1 Score', fontsize=12)
    ax.set_title('Per-Class F1 Scores', fontsize=14)
    ax.set_ylim(0, 1.1)
    ax.axhline(y=macro_f1, color='red', linestyle='--', label=f'Macro F1: {macro_f1:.3f}')
    ax.legend()
    plt.xticks(rotation=45, ha='right', fontsize=8)

    # Add value labels on bars
    for bar, score in zip(bars, f1_scores.values()):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                f'{score:.2f}', ha='center', va='bottom', fontsize=7)

    plt.tight_layout()
    f1_path = os.path.join(OUTPUT_DIR, 'f1_scores.png')
    plt.savefig(f1_path, dpi=150)
    plt.close()
    print(f"  Saved: {f1_path}")

    print("\n" + "=" * 60)
    print("EVALUATION COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
