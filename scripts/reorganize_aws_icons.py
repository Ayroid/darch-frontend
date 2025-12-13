#!/usr/bin/env python3
"""
Script to reorganize AWS icons in the public directory according to categories
and rename them to lower snake case format.
"""

import os
import shutil
import re
from pathlib import Path

# Base directory
PUBLIC_DIR = Path(__file__).parent.parent / "public"
AWS_ICONS_DIR = PUBLIC_DIR / "aws_icons"
NEW_AWS_ICONS_DIR = PUBLIC_DIR / "aws_icons_new"

# Category mappings
CATEGORY_MAPPINGS = {
    # Architecture Service Icons
    "Arch_Analytics": "analytics",
    "Arch_App-Integration": "app_integration",
    "Arch_Artificial-Intelligence": "artificial_intelligence",
    "Arch_Blockchain": "blockchain",
    "Arch_Business-Applications": "business_applications",
    "Arch_Cloud-Financial-Management": "cloud_financial_management",
    "Arch_Compute": "compute",
    "Arch_Containers": "containers",
    "Arch_Customer-Enablement": "customer_enablement",
    "Arch_Database": "database",
    "Arch_Developer-Tools": "developer_tools",
    "Arch_End-User-Computing": "end_user_computing",
    "Arch_Front-End-Web-Mobile": "front_end_web_mobile",
    "Arch_Games": "games",
    "Arch_General-Icons": "general",
    "Arch_Internet-of-Things": "internet_of_things",
    "Arch_Management-Governance": "management_governance",
    "Arch_Media-Services": "media_services",
    "Arch_Migration-Modernization": "migration_modernization",
    "Arch_Networking-Content-Delivery": "networking_content_delivery",
    "Arch_Quantum-Technologies": "quantum_technologies",
    "Arch_Satellite": "satellite",
    "Arch_Security-Identity-Compliance": "security_identity_compliance",
    "Arch_Storage": "storage",
    
    # Resource Icons
    "Res_Analytics": "analytics",
    "Res_Application-Integration": "app_integration",
    "Res_Artificial-Intelligence": "artificial_intelligence",
    "Res_Blockchain": "blockchain",
    "Res_Business-Applications": "business_applications",
    "Res_Compute": "compute",
    "Res_Containers": "containers",
    "Res_Database": "database",
    "Res_Developer-Tools": "developer_tools",
    "Res_End-User-Computing": "end_user_computing",
    "Res_Front-End-Web-Mobile": "front_end_web_mobile",
    "Res_General-Icons": "general",
    "Res_IoT": "internet_of_things",
    "Res_Management-Governance": "management_governance",
    "Res_Media-Services": "media_services",
    "Res_Migration-Modernization": "migration_modernization",
    "Res_Networking-Content-Delivery": "networking_content_delivery",
    "Res_Quantum-Technologies": "quantum_technologies",
    "Res_Security-Identity-Compliance": "security_identity_compliance",
    "Res_Storage": "storage",
}


def to_snake_case(text):
    """Convert text to snake_case."""
    # Remove file extension
    name, ext = os.path.splitext(text)
    
    # Replace common patterns
    name = name.replace("-", "_")
    name = name.replace(" ", "_")
    
    # Handle camelCase and PascalCase
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
    
    # Replace multiple underscores with single underscore
    name = re.sub('_+', '_', name)
    
    # Convert to lowercase
    name = name.lower()
    
    # Remove leading/trailing underscores
    name = name.strip('_')
    
    return name + ext


def get_icon_type(file_path):
    """Determine icon type based on path."""
    path_str = str(file_path)
    
    if "architecture_group_icons" in path_str:
        return "group"
    elif "architecture_service_icons" in path_str:
        return "service"
    elif "Category-Icons" in path_str:
        return "category"
    elif "Resource-Icons" in path_str:
        return "resource"
    else:
        return "other"


def get_category_from_path(file_path):
    """Extract category from file path."""
    path_parts = file_path.parts
    
    # For architecture service icons
    for i, part in enumerate(path_parts):
        if part in CATEGORY_MAPPINGS:
            return CATEGORY_MAPPINGS[part]
    
    # For resource icons and category icons
    if "Res_" in str(file_path) or "Arch-Category" in str(file_path):
        for part in path_parts:
            if part in CATEGORY_MAPPINGS:
                return CATEGORY_MAPPINGS[part]
    
    return "uncategorized"


def get_size_from_path(file_path):
    """Extract size from file path."""
    path_parts = file_path.parts
    
    for part in path_parts:
        if part in ["16", "32", "48", "64"]:
            return part
    
    # Check filename for size
    filename = file_path.stem
    if "_16" in filename or "_16_" in filename:
        return "16"
    elif "_32" in filename or "_32_" in filename:
        return "32"
    elif "_48" in filename or "_48_" in filename:
        return "48"
    elif "_64" in filename or "_64_" in filename:
        return "64"
    
    # Default to 48 if not specified
    return "48"


def organize_icons():
    """Reorganize and rename all AWS icons."""
    
    if not AWS_ICONS_DIR.exists():
        print(f"Error: {AWS_ICONS_DIR} does not exist")
        return
    
    # Create new directory structure
    if NEW_AWS_ICONS_DIR.exists():
        print(f"Removing existing {NEW_AWS_ICONS_DIR}")
        shutil.rmtree(NEW_AWS_ICONS_DIR)
    
    NEW_AWS_ICONS_DIR.mkdir(parents=True)
    
    # Statistics
    stats = {
        "total": 0,
        "copied": 0,
        "skipped": 0,
        "by_type": {},
        "by_category": {},
    }
    
    # Find all icon files
    icon_files = []
    for ext in ["*.svg", "*.png", "*.jpg", "*.jpeg"]:
        icon_files.extend(AWS_ICONS_DIR.rglob(ext))
    
    print(f"Found {len(icon_files)} icon files")
    
    for icon_file in icon_files:
        stats["total"] += 1
        
        try:
            # Get icon metadata
            icon_type = get_icon_type(icon_file)
            category = get_category_from_path(icon_file)
            size = get_size_from_path(icon_file)
            
            # Update statistics
            stats["by_type"][icon_type] = stats["by_type"].get(icon_type, 0) + 1
            stats["by_category"][category] = stats["by_category"].get(category, 0) + 1
            
            # Generate new filename
            new_filename = to_snake_case(icon_file.name)
            
            # Create directory structure: type/category/size/
            new_dir = NEW_AWS_ICONS_DIR / icon_type / category / size
            new_dir.mkdir(parents=True, exist_ok=True)
            
            # Destination path
            dest_path = new_dir / new_filename
            
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
    print("REORGANIZATION COMPLETE")
    print("="*60)
    print(f"Total files found: {stats['total']}")
    print(f"Successfully copied: {stats['copied']}")
    print(f"Skipped: {stats['skipped']}")
    print("\nBy Type:")
    for icon_type, count in sorted(stats["by_type"].items()):
        print(f"  {icon_type}: {count}")
    print("\nBy Category:")
    for category, count in sorted(stats["by_category"].items()):
        print(f"  {category}: {count}")
    
    # Replace old directory with new one
    if stats["copied"] > 0:
        print(f"\nReplacing {AWS_ICONS_DIR} with reorganized structure...")
        backup_dir = AWS_ICONS_DIR.parent / "aws_icons_backup"
        
        # Create backup
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        shutil.move(str(AWS_ICONS_DIR), str(backup_dir))
        
        # Move new structure
        shutil.move(str(NEW_AWS_ICONS_DIR), str(AWS_ICONS_DIR))
        
        print(f"✓ Original icons backed up to: {backup_dir}")
        print(f"✓ New structure is now at: {AWS_ICONS_DIR}")
    else:
        print("\nNo files were copied. Keeping original structure.")


if __name__ == "__main__":
    print("AWS Icons Reorganization Script")
    print("="*60)
    organize_icons()
