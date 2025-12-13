#!/usr/bin/env python3
"""
Simplify AWS icons structure to only service and size categorization.
"""

import os
import shutil
from pathlib import Path

# Base directory
PUBLIC_DIR = Path(__file__).parent.parent / "public"
AWS_ICONS_DIR = PUBLIC_DIR / "aws_icons"
NEW_AWS_ICONS_DIR = PUBLIC_DIR / "aws_icons_simplified"

def simplify_structure():
    """Reorganize icons with only service and size categorization."""
    
    if not AWS_ICONS_DIR.exists():
        print(f"Error: {AWS_ICONS_DIR} does not exist")
        return
    
    # Create new directory
    if NEW_AWS_ICONS_DIR.exists():
        print(f"Removing existing {NEW_AWS_ICONS_DIR}")
        shutil.rmtree(NEW_AWS_ICONS_DIR)
    
    NEW_AWS_ICONS_DIR.mkdir(parents=True)
    
    stats = {
        "total": 0,
        "copied": 0,
        "skipped": 0,
        "by_service": {},
    }
    
    # Get all existing categories by traversing the current structure
    all_services = set()
    
    # Collect all unique service names from all icon types
    for icon_type_dir in AWS_ICONS_DIR.iterdir():
        if not icon_type_dir.is_dir():
            continue
        
        for category_dir in icon_type_dir.iterdir():
            if category_dir.is_dir():
                all_services.add(category_dir.name)
    
    print(f"Found {len(all_services)} unique services")
    
    # Process all icon files
    for icon_file in AWS_ICONS_DIR.rglob("*"):
        if not icon_file.is_file():
            continue
        
        if icon_file.suffix.lower() not in ['.svg', '.png', '.jpg', '.jpeg']:
            continue
        
        stats["total"] += 1
        
        try:
            # Get the path parts
            parts = icon_file.relative_to(AWS_ICONS_DIR).parts
            
            # Structure: type/service/size/filename
            if len(parts) >= 4:
                icon_type, service, size, *filename_parts = parts
                filename = "/".join(filename_parts) if len(filename_parts) > 1 else filename_parts[0]
            elif len(parts) == 3:
                # Handle cases without explicit type
                service, size, filename = parts
            else:
                # Skip files that don't match expected structure
                stats["skipped"] += 1
                continue
            
            # Update statistics
            stats["by_service"][service] = stats["by_service"].get(service, 0) + 1
            
            # Create new directory structure: service/size/
            new_dir = NEW_AWS_ICONS_DIR / service / size
            new_dir.mkdir(parents=True, exist_ok=True)
            
            # Destination path
            dest_path = new_dir / filename
            
            # Handle duplicate filenames
            counter = 1
            original_dest = dest_path
            while dest_path.exists():
                name_part = original_dest.stem
                ext_part = original_dest.suffix
                dest_path = new_dir / f"{name_part}_{counter}{ext_part}"
                counter += 1
            
            # Copy file
            shutil.copy2(icon_file, dest_path)
            stats["copied"] += 1
            
            if stats["copied"] % 100 == 0:
                print(f"Processed {stats['copied']} files...")
                
        except Exception as e:
            print(f"Error processing {icon_file}: {e}")
            stats["skipped"] += 1
    
    # Print statistics
    print("\n" + "="*60)
    print("SIMPLIFICATION COMPLETE")
    print("="*60)
    print(f"Total files found: {stats['total']}")
    print(f"Successfully copied: {stats['copied']}")
    print(f"Skipped: {stats['skipped']}")
    print(f"\nServices ({len(stats['by_service'])}):")
    for service, count in sorted(stats["by_service"].items()):
        print(f"  {service}: {count}")
    
    # Replace old directory with new one
    if stats["copied"] > 0:
        print(f"\nReplacing {AWS_ICONS_DIR} with simplified structure...")
        backup_dir = AWS_ICONS_DIR.parent / "aws_icons_backup_original"
        
        # Keep old backup if exists
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        
        # Backup current structure
        old_backup = AWS_ICONS_DIR.parent / "aws_icons_backup"
        if old_backup.exists():
            shutil.move(str(old_backup), str(backup_dir))
        
        # Move current to backup
        shutil.move(str(AWS_ICONS_DIR), str(old_backup))
        
        # Move new structure
        shutil.move(str(NEW_AWS_ICONS_DIR), str(AWS_ICONS_DIR))
        
        print(f"✓ Simplified structure is now at: {AWS_ICONS_DIR}")
        print(f"✓ Previous structure backed up to: {old_backup}")
    else:
        print("\nNo files were copied. Keeping original structure.")


if __name__ == "__main__":
    print("AWS Icons Structure Simplification")
    print("="*60)
    simplify_structure()
