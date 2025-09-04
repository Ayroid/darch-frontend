# Homepage System

The homepage serves as the landing page for Darch, providing users with quick access to recent architectures, architecture templates, and the ability to create new designs.

## Overview

The homepage uses a clean, modern design with a 2x2 grid layout that displays recent architectures and pre-built architecture templates side by side. This allows users to either continue working on existing projects or start with proven architectural patterns.

## File Structure

```
components/homepage/
├── Homepage.tsx              # Main homepage container
├── RecentArchitectures.tsx   # Recent architectures section
├── ArchitectureTemplates.tsx # Architecture templates section
├── DarchSidebar.tsx         # Homepage sidebar navigation
└── TopBar.tsx               # Homepage top navigation
```

## Components

### Homepage.tsx

The main container component that orchestrates the homepage layout:

```typescript
// Location: components/homepage/Homepage.tsx
export default function Homepage() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <DarchSidebar />
          <SidebarInset className="flex flex-col">
            <TopBar />
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <RecentArchitectures />
                <ArchitectureTemplates />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
```

**Key Features:**
- Responsive layout with sidebar and main content area
- Two-column grid layout for desktop, single column for mobile
- Integrated tooltip provider for enhanced UX

### RecentArchitectures.tsx

Displays recently worked on architecture projects in a 2x2 grid layout:

```typescript
// Location: components/homepage/RecentArchitectures.tsx
export default function RecentArchitectures() {
  return (
    <div className="rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent architectures</h2>
          <Link href="/designer" className="bg-black text-white px-4 py-2 rounded-md">
            Create architecture
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Architecture cards */}
        </div>
      </div>
    </div>
  );
}
```

**Features:**
- **Visual Previews**: Mini architecture diagrams showing AWS services
- **Project Information**: Project name, environment, and last edited time
- **Quick Access**: Direct links to open projects in the designer
- **Create New**: Prominent button to start new architecture

**Card Layout:**
Each architecture card includes:
- Preview area (h-40) with mini service icons
- Project metadata (name, environment, last edited)
- Hover effects for better interactivity
- Responsive design for different screen sizes

### ArchitectureTemplates.tsx

Provides pre-built architecture templates using only "ready" AWS services:

```typescript
// Location: components/homepage/ArchitectureTemplates.tsx
interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  services: string[];
  filename: string;
}

const templates: Template[] = [
  {
    id: "single-ec2-instance",
    name: "Single EC2 Instance",
    description: "Minimal setup with just an EC2 instance for learning",
    icon: <FiServer className="w-6 h-6" />,
    difficulty: "Beginner",
    services: ["VPC", "EC2"],
    filename: "single-ec2-instance.json"
  }
  // Additional templates...
];
```

**Template Categories:**
1. **Single EC2 Instance** - Basic learning template
2. **Basic Web Setup** - VPC with EC2 and security groups
3. **Multi-Tier VPC** - Public and private subnets
4. **Multi-AZ Infrastructure** - High availability setup

**Template Features:**
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Service Badges**: Shows which AWS services are used
- **Auto-Loading**: Templates automatically load into the designer
- **Ready Services Only**: Uses only services marked as "ready" in the sidebar

## Template System

### Template Storage

Templates are stored as JSON files in the public directory:

```
public/templates/
├── single-ec2-instance.json
├── simple-web-app.json
├── multi-tier-vpc.json
└── multi-az-setup.json
```

### Template Structure

Each template follows the standard architecture JSON format:

```json
{
  "metadata": {
    "name": "Template Name",
    "description": "Template description",
    "version": "1.0.0",
    "createdAt": "2025-09-04T12:00:00.000Z",
    "lastModified": "2025-09-04T12:00:00.000Z",
    "provider": "aws"
  },
  "nodes": [
    // AWS service nodes using only "ready" services
  ],
  "connections": [
    // Service connections and relationships
  ],
  "variables": {
    // Template variables for customization
  },
  "outputs": {
    // Template outputs and references
  }
}
```

### Supported Services

Templates only use services marked as "ready" in the ServicesSidebar:

**Infrastructure:**
- AWS Region (container)
- Availability Zone (container)

**Compute:**
- EC2 instances
- Security Groups (container)

**Networking:**
- VPC (container)
- Public Subnet (container)
- Private Subnet (container)

### Template Loading Process

1. **User Selection**: User clicks on a template card
2. **File Fetch**: Template JSON is fetched from `/templates/`
3. **Data Loading**: JSON is loaded into the architecture store using `loadFromJSON()`
4. **Navigation**: User is automatically redirected to `/designer`
5. **Canvas Display**: Template appears ready for editing

## Design System

### Layout Principles

- **2x2 Grid**: Both sections use a 2-column grid for consistency
- **Large Cards**: Increased card size (h-40 preview area) for better visibility
- **Consistent Spacing**: 6px padding and gaps throughout
- **Hover Effects**: Subtle shadow and color changes on interaction

### Color Coding

**Difficulty Levels:**
- **Beginner**: Green background (`bg-green-100 text-green-800`)
- **Intermediate**: Yellow background (`bg-yellow-100 text-yellow-800`)
- **Advanced**: Red background (`bg-red-100 text-red-800`)

**Service Badges:**
- **Outline Style**: Consistent badge design across templates
- **Truncation**: Show max 3 services with "+X" for additional

## Navigation Integration

### Routing

- **Homepage**: `/` - Main landing page
- **Designer**: `/designer` - Architecture design interface
- **Template Loading**: Automatic navigation with pre-loaded data

### State Management

Templates integrate with the existing Zustand store system:

```typescript
const { loadFromJSON } = useArchitectureData();

const handleTemplateClick = async (template: Template) => {
  const response = await fetch(`/templates/${template.filename}`);
  const templateData = await response.json();
  loadFromJSON(templateData);
  router.push('/designer');
};
```

## Responsive Design

The homepage adapts to different screen sizes:

- **Desktop (lg+)**: Two-column layout with both sections visible
- **Tablet/Mobile**: Single column with stacked sections
- **Card Grids**: Always 2 columns within each section for consistency

## Future Enhancements

Potential improvements for the homepage system:

1. **Dynamic Templates**: User-created templates
2. **Template Search**: Filter templates by service or difficulty
3. **Recent Projects**: Integration with actual user project data
4. **Template Previews**: Enhanced visual previews of architectures
5. **Sharing**: Share templates between users
6. **Categories**: Organize templates by use case (web, data, ML, etc.)

## Related Documentation

- [State Management](./02-state-management.md) - Template data loading
- [Architecture Designer](./03-architecture-designer.md) - Target destination
- [Import/Export](./08-import-export.md) - Template JSON format
- [Service Sidebar](./05-service-sidebar.md) - Available AWS services
