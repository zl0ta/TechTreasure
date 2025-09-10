# Overview

This is a complete e-commerce web application built with React + TypeScript frontend and Node.js + Express backend. The application features a modern shopping experience with product browsing, cart management, user authentication, order processing, and a blog section. It uses a file-based data storage system with JSON files and implements a full REST API architecture.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses **React 18** with **TypeScript** and **Vite** as the build tool. The architecture follows a modern component-based approach:

- **UI Framework**: Built with shadcn/ui components and Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Session-based auth with custom hooks

The frontend is organized into logical directories:
- `/pages` - Route components for different application views
- `/components` - Reusable UI components organized by feature
- `/hooks` - Custom React hooks for business logic
- `/lib` - Utility functions and configurations

## Backend Architecture
The backend uses **Express.js** with **TypeScript** in a REST API pattern:

- **API Structure**: RESTful endpoints for products, users, cart, orders, blog, and authentication
- **Session Management**: Express sessions with in-memory storage for user authentication
- **Password Security**: bcrypt for password hashing
- **Data Storage**: File-based JSON storage with a custom storage abstraction layer
- **Validation**: Shared Zod schemas between frontend and backend
- **Development Setup**: Vite integration for hot reloading in development

Key architectural decisions:
- Monorepo structure with shared schemas in `/shared` directory
- Custom storage interface that can be easily swapped for a database later
- Session-based authentication instead of JWT for simplicity
- Separation of concerns with dedicated route handlers and storage layer

## Data Storage
The application uses **file-based JSON storage** as a database simulation:

- **Products**: Complete product catalog with categories, images, and inventory
- **Users**: User accounts with hashed passwords and optional address information  
- **Orders**: Order history with items, pricing, and status tracking
- **Blog**: Content management for blog posts with categories and metadata
- **Cart**: In-memory cart storage per user session

The storage layer is abstracted through an interface that supports easy migration to a proper database like PostgreSQL (Drizzle ORM is already configured for future use).

## External Dependencies

- **Database**: Configured for Neon PostgreSQL with Drizzle ORM (currently unused, falls back to JSON files)
- **UI Components**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Image Hosting**: Unsplash for product and blog images
- **Development Tools**: 
  - Replit integration for development environment
  - Vite plugins for enhanced development experience
  - TypeScript for type safety across the entire stack

The application is designed to be deployment-ready with environment-based configuration and can easily scale from the current file-based storage to a full database system.