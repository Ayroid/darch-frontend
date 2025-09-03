# Service Sidebar

This document covers the Services Sidebar component, which provides a comprehensive library of AWS services for drag-and-drop functionality in the architecture designer.

## Overview

The Services Sidebar is a collapsible panel that contains categorized AWS services and resources. Users can drag services from this sidebar onto the canvas to build their cloud architectures.

**Main Component**: `components/designer/ServicesSidebar.tsx`
**Width**: 280px
**Position**: Fixed left sidebar

## Component Structure

### Main Component Layout

```typescript
export default function ServicesSidebar({
  isOpen,
  onToggle,
}: ServicesSidebarProps) {
  return (
    <div className="relative">
      {/* Main Sidebar */}
      <div className={`fixed top-16 left-0 bg-white border-r border-gray-300 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Header */}
        <div className="p-0 border-b border-gray-200">
          <Image src="/aws_icons/architecture_group_icons/AWS-Cloud-logo_32_Dark.svg" alt="AWS Logo" />
        </div>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <CategorySection key={category} category={category} />
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <ToggleButton isOpen={isOpen} onToggle={onToggle} />
    </div>
  );
}
```

## Service Categories

### Category Structure

The sidebar organizes AWS services into logical categories:

```typescript
const categories = [
  "Infrastructure",
  "Compute",
  "Network",
  "Storage",
  "Database",
  "Security & Identity",
  "Containers",
  "Management",
  "Analytics",
];
```

### Category Mapping

Some categories have internal mappings:

```typescript
const categoryMapping: { [key: string]: string } = {
  "Security & Identity": "Security",
};
```

### Category Icons

Each category has a dedicated icon:

```typescript
const getCategoryIcon = (category: string) => {
  const iconProps = { className: "w-6 h-6 text-gray-600" };

  switch (category) {
    case "Infrastructure": return <BsBuilding {...iconProps} />;
    case "Compute": return <FiCpu {...iconProps} />;
    case "Network": return <FiGlobe {...iconProps} />;
    case "Storage": return <FiDatabase {...iconProps} />;
    case "Database": return <FiServer {...iconProps} />;
    case "Security & Identity": return <FiShield {...iconProps} />;
    case "Containers": return <FiBox {...iconProps} />;
    case "Management": return <FiSettings {...iconProps} />;
    case "Analytics": return <FiBarChart {...iconProps} />;
    default: return <FiCpu {...iconProps} />;
  }
};
```

## AWS Services Definition

### Service Interface

```typescript
interface AWSService {
  id: string;                    // Unique service identifier
  name: string;                  // Display name
  icon: string;                  // Icon path
  category: string;              // Service category
  isContainer?: boolean;         // Whether service can contain others
  status: "ready" | "in-development";  // Implementation status
}
```

### Service Categories Breakdown

#### Infrastructure Components
```typescript
{
  id: "aws-region",
  name: "AWS Region",
  icon: "/aws_icons/architecture_group_icons/AWS-Cloud_32.svg",
  category: "Infrastructure",
  isContainer: true,
  status: "ready",
},
{
  id: "aws-availability-zone",
  name: "Availability Zone",
  icon: "/aws_icons/architecture_group_icons/Region_32.svg",
  category: "Infrastructure",
  isContainer: true,
  status: "ready",
}
```

#### Compute Services
```typescript
{
  id: "aws-ec2",
  name: "EC2",
  icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_Amazon-EC2_32.svg",
  category: "Compute",
  status: "ready",
},
{
  id: "aws-lambda",
  name: "Lambda",
  icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_AWS-Lambda_32.svg",
  category: "Compute",
  status: "in-development",
}
```

#### Network Services
```typescript
{
  id: "aws-vpc",
  name: "VPC",
  icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Amazon-Virtual-Private-Cloud_32.svg",
  category: "Network",
  isContainer: true,
  status: "ready",
},
{
  id: "aws-private-subnet",
  name: "Private Subnet",
  icon: "/aws_icons/architecture_group_icons/Private-subnet_32.svg",
  category: "Network",
  isContainer: true,
  status: "ready",
}
```

#### Database Services
```typescript
{
  id: "aws-rds",
  name: "RDS",
  icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-RDS_32.svg",
  category: "Database",
  status: "in-development",
},
{
  id: "aws-dynamodb",
  name: "DynamoDB",
  icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-DynamoDB_32.svg",
  category: "Database",
  status: "in-development",
}
```

#### Storage Services
```typescript
{
  id: "aws-s3",
  name: "S3",
  icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-Simple-Storage-Service_32.svg",
  category: "Storage",
  status: "in-development",
},
{
  id: "aws-ebs",
  name: "EBS",
  icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-Elastic-Block-Store_32.svg",
  category: "Storage",
  status: "in-development",
}
```

#### Security Services
```typescript
{
  id: "aws-iam",
  name: "IAM",
  icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-Identity-and-Access-Management_32.svg",
  category: "Security",
  status: "in-development",
},
{
  id: "aws-security-group",
  name: "Security Group",
  icon: "/aws_icons/architecture_group_icons/EC2-instance-contents_32.svg",
  category: "Compute",
  isContainer: true,
  status: "ready",
}
```

#### Management & Governance
```typescript
{
  id: "aws-cloudwatch",
  name: "CloudWatch",
  icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_Amazon-CloudWatch_32.svg",
  category: "Management",
  status: "in-development",
},
{
  id: "aws-cloudformation",
  name: "CloudFormation",
  icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-CloudFormation_32.svg",
  category: "Management",
  isContainer: true,
  status: "in-development",
}
```

## State Management

### UI Store Integration

The sidebar uses the UI store for state management:

```typescript
const { expandedCategories, toggleCategory } = useUIStore();
```

### Expanded Categories State

```typescript
// In UI Store
interface UIState {
  expandedCategories: Set<string>;
  // ... other state
}

interface UIActions {
  toggleCategory: (category: string) => void;
  // ... other actions
}

// Implementation
toggleCategory: (category) =>
  set((state) => {
    if (state.expandedCategories.has(category)) {
      state.expandedCategories.delete(category);
    } else {
      state.expandedCategories.add(category);
    }
  }),
```

## Category Sections

### Category Header

```typescript
<button
  onClick={() => toggleCategory(category)}
  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 mb-4"
>
  <div className="flex justify-center items-center space-x-3">
    <div className="w-8 h-6 rounded flex items-center justify-center">
      {getCategoryIcon(category)}
    </div>
    <span className="font-medium text-gray-900">
      {category}
    </span>
  </div>
  <FiChevronDown
    className={`h-4 w-4 text-gray-500 transition-transform ${
      isExpanded ? "transform rotate-180" : ""
    }`}
  />
</button>
```

### Category Content

The content layout differs for Infrastructure vs other categories:

#### Infrastructure Layout (Full-width)
```typescript
{category === "Infrastructure" ? (
  <div className="space-y-2">
    {services.map((service) => (
      <div
        key={service.id}
        draggable
        onDragStart={(event) => onDragStart(event, service)}
        className="flex items-center p-3 border rounded-lg cursor-move transition-colors group bg-white border-gray-200 hover:border-purple-500 hover:bg-purple-50"
      >
        <div className="relative w-8 h-8 mr-3 flex-shrink-0">
          <Image src={service.icon} alt={service.name} fill sizes="32px" />
        </div>
        <span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium">
          {service.name}
        </span>
      </div>
    ))}
  </div>
) : (
  // Grid layout for other categories
)}
```

#### Other Categories Layout (3-column grid)
```typescript
<div className="grid grid-cols-3 gap-2">
  {services.map((service) => (
    <div
      key={service.id}
      draggable
      onDragStart={(event) => onDragStart(event, service)}
      className="flex flex-col items-center p-2 border rounded-lg cursor-move transition-colors group bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50"
    >
      <div className="relative w-8 h-8 mb-1">
        <Image src={service.icon} alt={service.name} fill sizes="32px" />
      </div>
      <span className="text-xs text-center text-gray-700 group-hover:text-blue-700 font-medium leading-tight">
        {service.name}
      </span>
    </div>
  ))}
</div>
```

## Drag and Drop System

### Drag Start Handler

```typescript
const onDragStart = (event: React.DragEvent, service: AWSService) => {
  event.dataTransfer.setData("application/reactflow", service.id);
  event.dataTransfer.setData("application/name", service.name);
  event.dataTransfer.setData("application/icon", service.icon);
  event.dataTransfer.setData(
    "application/isContainer",
    service.isContainer ? "true" : "false"
  );
  event.dataTransfer.effectAllowed = "move";
};
```

### Data Transfer Format

The drag operation transfers the following data:
- **application/reactflow**: Service ID
- **application/name**: Service display name
- **application/icon**: Icon path
- **application/isContainer**: Container flag

This data is consumed by the Canvas component's drop handler.

## Toggle Button

### Animated Toggle Button

```typescript
<button
  onClick={onToggle}
  className={`fixed z-50 bg-white border border-gray-300 shadow-lg hover:bg-gray-50 transition-all duration-300 ease-in-out ${
    isOpen
      ? "left-[280px] rounded-r-lg border-l-0"
      : "left-0 rounded-r-lg"
  }`}
  style={{
    top: "calc(50vh + 2rem)",
    transform: "translateY(-50%)",
    padding: "12px 4px",
  }}
>
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${
      isOpen ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="gray"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
</button>
```

**Features**:
- Follows sidebar position (280px when open, 0px when closed)
- Animated rotation for visual feedback
- Positioned at vertical center of viewport

## Service Status System

### Status Types

Services have two status types:

1. **"ready"**: Fully implemented and functional
2. **"in-development"**: Placeholder for future implementation

### Visual Status Indicators

```typescript
className={`... ${
  service.status === "in-development" ? "opacity-50" : ""
}`}
```

Services marked as "in-development" are visually dimmed (50% opacity) to indicate their status.

### Ready Services

Currently ready services include:
- **Infrastructure**: AWS Region, Availability Zone
- **Compute**: EC2, Security Group
- **Network**: VPC, Private Subnet, Public Subnet

## Styling and Animations

### Sidebar Animation

```css
transform transition-transform duration-300 ease-in-out
${isOpen ? "translate-x-0" : "-translate-x-full"}
```

### Hover Effects

#### Container Services (Infrastructure)
```css
hover:border-purple-500 hover:bg-purple-50
group-hover:text-purple-700
```

#### Regular Services
```css
hover:border-blue-400 hover:bg-blue-50
group-hover:text-blue-700
```

### Visual Hierarchy

1. **Category Headers**: Bold text with icons and expand/collapse indicators
2. **Service Items**: Service icon + name with hover effects
3. **Status Indication**: Opacity changes for development status

## Icon System

### Icon Sources

AWS icons are organized in a structured directory:

```
public/aws_icons/
├── architecture_group_icons/     # Container/group icons
├── architecture_service_icons/   # Individual service icons
│   ├── Arch_Compute/32/
│   ├── Arch_Database/32/
│   ├── Arch_Networking-Content-Delivery/32/
│   ├── Arch_Storage/32/
│   ├── Arch_Security-Identity-Compliance/32/
│   ├── Arch_Management-Governance/32/
│   ├── Arch_Containers/32/
│   └── Arch_Analytics/32/
└── Category-Icons_07312025/
```

### Icon Loading

Icons are loaded using Next.js Image component:

```typescript
<Image
  src={service.icon}
  alt={service.name}
  fill
  className="object-contain"
  sizes="32px"
/>
```

## Service Filtering and Search

### Category-based Filtering

```typescript
const getServicesForCategory = (category: string) => {
  const mappedCategory = categoryMapping[category] || category;
  return awsServices.filter((service) => service.category === mappedCategory);
};
```

### Future Enhancements

The current implementation supports:
- Category expansion/collapse
- Visual status indicators
- Drag and drop functionality

Potential future enhancements:
- Search functionality
- Service filtering by status
- Custom service categories
- Service favorites

## Integration with Canvas

### Data Flow

1. User drags service from sidebar
2. `onDragStart` sets transfer data
3. Canvas `onDrop` handler receives data
4. Canvas creates new node with service data
5. Node is added to architecture with auto-configuration

### Service to Node Mapping

```typescript
// In Canvas onDrop handler
const newNode: Node = {
  id: getNodeId(serviceId),
  type: isContainer ? "awsContainer" : "awsService",
  position,
  data: {
    icon,
    name,
    serviceId,
    ...(isContainer && { isContainer: true }),
  },
  ...(isContainer && {
    style: { width: 250, height: 200 },
  }),
};
```

This comprehensive service sidebar provides users with an organized, intuitive way to access AWS services and build their cloud architectures through simple drag-and-drop interactions.
