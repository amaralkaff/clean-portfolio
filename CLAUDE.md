# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code quality checks

## Architecture Overview

This is a **Next.js 15 portfolio website** using the App Router with TypeScript, Tailwind CSS, and a **ViewModel pattern** for state management.

### Key Architecture Patterns

**ViewModel Pattern**: Each component has a corresponding ViewModel in `app/viewModels/` that encapsulates:
- Component state interface (e.g., `AppState`, `PhonkMusicState`)  
- Action interface (e.g., `AppActions`, `PhonkMusicActions`)
- Custom hook that returns `[state, actions]` tuple

**Theme System**: Auto-switching dark/light mode based on time of day (6 PM - 6 AM = dark). Manual toggle disables auto-mode. Theme state managed via React Context in `app/context/ThemeContext.tsx`.

**Dynamic Imports**: All major components use `next/dynamic` with SSR disabled for animations and media components to improve initial load performance.

**Project Data Model**: Centralized project information in `app/models/ProjectData.ts` with strongly typed interfaces for projects and tech stacks.

### Component Structure

- **Layout**: Two-panel responsive design (project list + main content)
- **Modal System**: Video project previews with fullscreen capability
- **Music Player**: Auto-playing Phonk music player with complex autoplay handling for browser restrictions
- **Theme Toggle**: Time-based automatic dark/light mode switching
- **Asset Loading**: Lottie animations for loading states

### Media Assets

- Videos in `/public/video/` (WebM format for projects)
- Music tracks in `/public/music/` (MP3 format)
- Tech stack logos in `/public/logos/`
- Custom fonts in `/public/fonts/` (Silkscreen family)

### State Management Philosophy

No external state management library. Uses:
- ViewModel pattern with custom hooks
- React Context for theme
- Component-level state with proper encapsulation
- Ref-based audio management for complex playback scenarios