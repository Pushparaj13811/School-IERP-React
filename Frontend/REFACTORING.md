# Frontend Refactoring Documentation

## Overview

This document outlines the refactoring work done to make the frontend more modular and to migrate from Bootstrap to Tailwind CSS. The refactoring was done with the following goals in mind:

1. Make components reusable and modular
2. Replace Bootstrap with Tailwind CSS while maintaining the same styling
3. Keep all features and functionality the same
4. Improve code organization and maintainability

## Directory Structure

The refactored codebase follows this structure:

```
src/
├── components/
│   ├── common/         # Reusable components shared across the app
│   ├── layout/         # Layout components (Navbar, Sidebar, PageLayout)
│   └── ui/             # Basic UI components (Button, Card, etc.)
├── pages/
│   ├── student/        # Student-specific pages
│   └── parent/         # Parent-specific pages
├── assets/             # Static assets
└── App.tsx             # Main application entry point
```

## Component Categories

### Layout Components

- `PageLayout.tsx`: Serves as the main layout wrapper
- `Navbar.tsx`: Application header with navigation controls
- `Sidebar.tsx`: Side navigation menu

### UI Components

- `Button.tsx`: Reusable button component with different variants
- `Card.tsx`: Content container with optional title
- `StatCard.tsx`: Card displaying statistics with icon and count

### Common Components

- `Announcement.tsx`: Component for displaying announcements
- `ProfileSection.tsx`: Component for displaying user profile details

## Tailwind CSS Migration

We've replaced Bootstrap with Tailwind CSS. Here's what changed:

1. Bootstrap classes were replaced with equivalent Tailwind classes
2. Custom utility classes were created in index.css using Tailwind's @layer feature
3. A custom color theme was defined in tailwind.config.js to match the existing styles

## How to Use the Components

### Layout

Wrap your page content with the PageLayout component:

```jsx
<PageLayout>
  {/* Page content */}
</PageLayout>
```

### UI Components

Button:

```jsx
<Button 
  variant="primary" // 'primary', 'secondary', or 'outline'
  onClick={handleClick} 
  className="px-5" // additional classes
>
  Click Me
</Button>
```

Card:

```jsx
<Card title="Card Title"> // title is optional
  {/* Card content */}
</Card>
```

StatCard:

```jsx
<StatCard 
  icon="bi-calendar-check" 
  title="Attendance" 
  count={125} 
  bgColor="primary" // 'primary', 'success', 'secondary', 'danger'
  onClick={handleClick} // optional
/>
```

### Common Components

Announcement:

```jsx
<Announcement
  date="24th Feb 2025"
  time="02:30 PM"
  title="Title of announcement"
  content="Content of the announcement..."
/>
```

ProfileSection:

```jsx
<ProfileSection 
  details={[
    { label: 'Name', value: 'John Doe' },
    { label: 'Class', value: '10th' },
    // ...more details
  ]}
  profileImage="/path/to/image.jpg"
  onEdit={handleEdit} // optional
  onPrint={handlePrint} // optional
/>
```

## Next Steps

- Complete the refactoring of additional page components
- Create unit tests for components
- Consider implementing a state management solution for shared state 