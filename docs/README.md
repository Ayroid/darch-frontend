# Darch Frontend Documentation

Welcome to the comprehensive documentation for Darch - a cloud architecture designer application built with Next.js, React, and TypeScript.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Documentation Structure](#documentation-structure)

## Overview

Darch is a sophisticated cloud architecture design tool that allows users to visually create, edit, and manage AWS cloud infrastructure diagrams. The application provides an intuitive drag-and-drop interface for designing complex cloud architectures with automatic configuration and validation.

### Key Technologies
- **Frontend Framework**: Next.js 15.4.6 with React 19
- **Canvas Library**: ReactFlow (@xyflow/react)
- **State Management**: Zustand with Immer
- **UI Components**: Radix UI with Tailwind CSS
- **Type System**: TypeScript with Zod validation
- **Icons**: React Icons + Custom AWS Icons

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── designer/          # Architecture designer components
│   ├── homepage/          # Homepage components
│   └── ui/               # Reusable UI components
├── lib/                   # Core business logic
│   ├── stores/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── hooks/                # Custom React hooks
└── docs/                # This documentation
```

## Core Features

1. **Visual Architecture Designer** - Drag-and-drop interface for creating cloud diagrams
2. **AWS Service Library** - Comprehensive collection of AWS services and resources
3. **Architecture Templates** - Pre-built templates using ready AWS services for quick start
4. **Auto-Configuration System** - Intelligent field population based on container relationships
5. **State Management** - Persistent state with undo/redo capabilities
6. **Import/Export Functionality** - Save and load architecture configurations
7. **Keyboard Shortcuts** - Complete keyboard navigation support
8. **Configuration Management** - Detailed configuration forms for each AWS resource
9. **Real-time Validation** - Form validation with error handling
10. **Responsive Homepage** - Modern landing page with recent projects and templates

## Documentation Structure

Each major functionality is documented in detail:

- **[Application Structure](./01-application-structure.md)** - Overall app architecture and routing
- **[State Management](./02-state-management.md)** - Zustand stores and data flow
- **[Architecture Designer](./03-architecture-designer.md)** - Main design interface
- **[Canvas System](./04-canvas-system.md)** - ReactFlow canvas and node management
- **[Service Sidebar](./05-service-sidebar.md)** - AWS services library
- **[Configuration System](./06-configuration-system.md)** - Resource configuration management
- **[Auto-Configuration](./07-auto-configuration.md)** - Intelligent field population
- **[Import/Export](./08-import-export.md)** - File management and data persistence
- **[Keyboard Shortcuts](./09-keyboard-shortcuts.md)** - Complete shortcuts system
- **[Validation System](./10-validation-system.md)** - Form validation and error handling
- **[UI Components](./11-ui-components.md)** - Reusable component library
- **[Utility Functions](./12-utility-functions.md)** - Helper functions and algorithms
- **[Type System](./13-type-system.md)** - TypeScript types and interfaces
- **[Homepage System](./14-homepage.md)** - Landing page, recent projects, and architecture templates
- **[Undo/Redo System](./15-undo-redo-system.md)** - Enhanced state management with action tracking

## Getting Started

To understand how the application works, start with:

1. [Application Structure](./01-application-structure.md) - Understand the overall architecture
2. [State Management](./02-state-management.md) - Learn how data flows through the app
3. [Architecture Designer](./03-architecture-designer.md) - Explore the main interface

Each document contains detailed code explanations, file locations, and implementation details for complete understanding of the functionality.
