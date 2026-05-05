"""
Step 8: Full pipeline runner — executes all steps in order with timing.
Usage: python run_pipeline.py
"""
import os
import sys
import time
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

STEPS = [
    ('Dataset Exploration', 'explore_dataset.py'),
    ('Feature Extraction', 'extract_features.py'),
    ('Model Training', 'train_model.py'),
    ('Model Evaluation', 'evaluate_model.py'),
    ('Model Export', 'export_model.py'),
]


def run_step(name, script):
    """Run a single pipeline step and return (success, duration)."""
    script_path = os.path.join(SCRIPT_DIR, script)
    print(f"\n{'#' * 60}")
    print(f"# STEP: {name}")
    print(f"# Script: {script}")
    print(f"{'#' * 60}\n")

    start = time.time()
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            cwd=SCRIPT_DIR,
            check=True
        )
        duration = time.time() - start
        return True, duration
    except subprocess.CalledProcessError as e:
        duration = time.time() - start
        print(f"\n*** STEP FAILED: {name} ***")
        print(f"Exit code: {e.returncode}")
        return False, duration
    except Exception as e:
        duration = time.time() - start
        print(f"\n*** STEP ERROR: {name} ***")
        print(f"Error: {e}")
        return False, duration


def main():
    print("=" * 60)
    print("  CHORD CLASSIFICATION — FULL PIPELINE")
    print("=" * 60)

    total_start = time.time()
    results = []

    for name, script in STEPS:
        success, duration = run_step(name, script)
        results.append((name, success, duration))

        if not success:
            print(f"\nPipeline stopped at '{name}'. Fix the error and re-run.")
            break

    total_duration = time.time() - total_start

    # Summary table
    print(f"\n\n{'=' * 60}")
    print("PIPELINE SUMMARY")
    print(f"{'=' * 60}")
    print(f"{'Step':<25} {'Status':<12} {'Duration':<10}")
    print(f"{'-' * 25} {'-' * 12} {'-' * 10}")

    all_passed = True
    for name, success, duration in results:
        status = "Done" if success else "FAILED"
        icon = "\u2705" if success else "\u274c"
        print(f"{name:<25} {icon} {status:<8} {duration:.1f}s")
        if not success:
            all_passed = False

    print(f"{'-' * 25} {'-' * 12} {'-' * 10}")
    print(f"{'Total':<25} {'':12} {total_duration:.1f}s")

    if all_passed:
        print(f"\n{'=' * 60}")
        print("ALL STEPS COMPLETED SUCCESSFULLY!")
        print(f"{'=' * 60}")
        print("\nGenerated files in ml/outputs/:")
        outputs_dir = os.path.join(SCRIPT_DIR, 'outputs')
        if os.path.exists(outputs_dir):
            for f in sorted(os.listdir(outputs_dir)):
                size = os.path.getsize(os.path.join(outputs_dir, f))
                if size > 1024:
                    print(f"  {f} ({size / 1024:.1f} KB)")
                else:
                    print(f"  {f} ({size} B)")

        print("\nNext steps:")
        print("  1. Copy outputs/chord_classifier.json to project root")
        print("  2. Copy outputs/scaler_params.json to project root")
        print("  3. Include ml/chord_classifier_inference.js in app.html")
    else:
        print(f"\nPipeline failed. Check errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
