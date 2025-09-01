# Liga MX Website

## Overview

Liga MX Website is a comprehensive sports website dedicated to the Mexican football league. The application provides fans with access to league standings, team information, match fixtures, and detailed team profiles. Built as a static website with dynamic JavaScript functionality, it offers an engaging user experience with modern animations and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows a multi-page static website architecture with the following key design decisions:

- **Static HTML Pages**: Each major section (home, standings, teams, fixtures, team profiles) has its own dedicated HTML file for better SEO and navigation
- **Modular CSS**: Separate stylesheets for main styles, animations, and team-specific styling to maintain clean separation of concerns
- **Component-based JavaScript**: Each page has its own JavaScript module handling specific functionality, promoting code organization and maintainability

### Data Management
- **JSON-based Data Storage**: All application data (teams, standings, fixtures) is stored in JSON files within a `/data` directory
- **Client-side Data Loading**: JavaScript modules fetch and process JSON data dynamically for real-time updates
- **Local Storage Integration**: User preferences and selected team information are persisted using browser local storage

### User Interface Design
- **Responsive Design**: Mobile-first approach with hamburger navigation and flexible layouts
- **Animation System**: Dedicated CSS animation file with keyframe animations for enhanced user experience
- **Theme System**: Dynamic team-based theming that changes colors and styling based on selected team
- **Progressive Enhancement**: Core functionality works without JavaScript, with enhanced features added via JavaScript

### Navigation and Routing
- **Multi-page Navigation**: Traditional web navigation with dedicated pages for each section
- **Query Parameter Routing**: Team profiles use URL parameters for deep linking and bookmarking
- **Smooth Scrolling**: Enhanced navigation with smooth scroll animations between sections

### Performance Considerations
- **Lazy Loading**: Data is loaded on-demand as users navigate to different sections
- **Efficient Filtering**: Client-side filtering and searching for teams and matches without server requests
- **Optimized Assets**: Use of CDN resources for external libraries (Font Awesome, Google Fonts)

## External Dependencies

### CSS Libraries
- **Font Awesome 6.0.0**: Icon library for consistent iconography throughout the application
- **Google Fonts (Roboto)**: Typography system for better readability and visual consistency

### Data Sources
- **Static JSON Files**: Self-contained data files for teams, standings, and fixtures information
- **SVG Assets**: Vector graphics for team logos and league branding stored in `/assets` directory

### Browser APIs
- **Local Storage API**: For persisting user preferences and selected team data
- **URL Parameters API**: For handling team profile routing and deep linking
- **Intersection Observer API**: Potential use for scroll-based animations and lazy loading