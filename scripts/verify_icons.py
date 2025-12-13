#!/usr/bin/env python3
"""Verify the reorganized AWS icons structure."""

import os
from pathlib import Path

PUBLIC_DIR = Path(__file__).parent.parent / "public"
AWS_ICONS_DIR = PUBLIC_DIR / "aws_icons"

def verify_structure():
    """Verify the new directory structure."""
    
    print("Verification Report")
    print("="*60)
    
    # Check top-level directories
    expected_types = ["category", "group", "resource", "service"]
    actual_types = [d.name for d in AWS_ICONS_DIR.iterdir() if d.is_dir()]
    
    print("\n1. Top-level icon types:")
    for icon_type in actual_types:
        print(f"   ✓ {icon_type}")
    
    # Check service categories
    service_dir = AWS_ICONS_DIR / "service"
    if service_dir.exists():
        categories = sorted([d.name for d in service_dir.iterdir() if d.is_dir()])
        print(f"\n2. Service categories ({len(categories)}):")
        for cat in categories[:10]:
            print(f"   - {cat}")
        if len(categories) > 10:
            print(f"   ... and {len(categories) - 10} more")
    
    # Check sample files
    compute_48 = AWS_ICONS_DIR / "service" / "compute" / "48"
    if compute_48.exists():
        files = sorted([f.name for f in compute_48.iterdir() if f.is_file()])
        print(f"\n3. Sample files in service/compute/48 ({len(files)} files):")
        for f in files[:10]:
            print(f"   - {f}")
        if len(files) > 10:
            print(f"   ... and {len(files) - 10} more")
    
    # Count total files
    total_files = sum(1 for _ in AWS_ICONS_DIR.rglob("*") if _.is_file())
    print(f"\n4. Total icon files: {total_files}")
    
    # Check naming convention
    print("\n5. Naming convention check:")
    sample_files = list(AWS_ICONS_DIR.rglob("*.svg"))[:20]
    all_lowercase = all(f.stem == f.stem.lower() for f in sample_files)
    has_underscores = all("_" in f.stem or f.stem.isalnum() for f in sample_files)
    
    if all_lowercase:
        print("   ✓ All filenames are lowercase")
    else:
        print("   ✗ Some filenames contain uppercase letters")
    
    if has_underscores or all(f.stem.replace("_", "").replace("-", "").isalnum() for f in sample_files):
        print("   ✓ Using snake_case naming convention")
    
    print("\n" + "="*60)
    print("Verification complete!")

if __name__ == "__main__":
    verify_structure()
