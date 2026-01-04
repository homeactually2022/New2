# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A colorful cartoon racing game for children built with HTML5 Canvas and vanilla JavaScript. The game features a player-controlled car that must avoid oncoming enemy cars, with a scoring system, lives system, and four difficulty levels.

## Development Commands

### Running Locally

```bash
# Method 1: Direct file opening
# Simply open index.html in a browser

# Method 2: Using HTTP server (recommended)
npx http-server -p 3000
# Access at http://localhost:3000
```

### Deployment

```bash
# Deploy to Vercel (requires Vercel CLI installed globally)
vercel
```

## Architecture

### Core Structure

The game follows a simple single-page architecture:
- `index.html` - Main page with game canvas, UI controls, and speed selector
- `game.js` - All game logic, rendering, and state management
- `style.css` - Responsive styling with gradient backgrounds and animations
- `vercel.json` - SPA routing configuration for deployment

### Game Loop Architecture

The game uses `requestAnimationFrame` for the main loop (`gameLoop()`) which:
1. Clears and redraws the background with road/grass/sky layers
2. Updates road line positions for scrolling effect
3. Draws player car and all enemy cars
4. Updates enemy positions and spawns new enemies based on difficulty
5. Checks for collisions between player and enemies
6. Increments frame counter for enemy spawn timing

### State Management

All game state is stored in global variables (no framework):
- `gameRunning` - Boolean controlling the game loop
- `score`, `lives` - Player progress tracking
- `gameSpeed` - Current scroll speed (increases with score)
- `selectedSpeed` - Difficulty level ('slow'|'normal'|'fast'|'super')
- `player` - Object with x, y, width, height, color, speed
- `enemies` - Array of enemy car objects
- `roadLines` - Array of road line marker objects

### Difficulty System

Speed configuration in `SPEED_CONFIG` object (game.js:18-39) controls:
- `initialSpeed` - Starting scroll speed
- `increment` - Speed increase per 100 points
- `enemyFrequency` - Frames between enemy spawns (lower = more frequent)

The difficulty affects both game speed and enemy spawn rate.

### Rendering System

Custom `drawCar()` function (game.js:81-113) renders cartoon-style cars using canvas primitives:
- Main body (rectangle)
- Rounded top (arc)
- Windows, wheels, headlights
- Different colors passed as parameters

Background layers drawn in order: sky, grass (sides), road (center), road lines.

### Input Handling

Three input methods supported:
- Keyboard: Arrow keys (game.js:281-290)
- Touch: Tap left/right sides of canvas (game.js:293-306)
- Mouse: Click left/right sides of canvas (game.js:309-320)

All inputs move player between three lanes at fixed positions (80, 165, 250 pixels).

### Collision Detection

Simple AABB (Axis-Aligned Bounding Box) collision in `checkCollision()` (game.js:183-207):
- Checks overlap between player and each enemy rectangle
- On collision: decrements lives, removes enemy, changes player car color
- Game ends when lives reach 0

### Color Scheme

Defined in `COLORS` object (game.js:42-49):
- Player cars: 5 vibrant colors (red, teal, yellow, mint, pink)
- Enemy cars: 5 different colors to distinguish from player
- Environment: Sky blue, grass green, dark road, yellow road lines

Player car color randomizes on game start and after each collision for visual feedback.

## Key Implementation Details

### Lane System
The game uses 3 fixed lanes at x-positions 80, 165, 250. Enemy cars spawn randomly in these lanes. Player movement snaps between lanes rather than continuous movement.

### Score Progression
- +10 points when an enemy car exits the bottom of screen
- Game speed increases by difficulty-specific increment every 100 points
- Final score displayed on game over screen

### Canvas Size
Fixed 400x600px canvas (game.js:6-7). Responsive CSS scales the canvas on mobile but maintains aspect ratio.

## UI Components

Speed selector buttons (index.html:27-47) use:
- `data-speed` attribute to set difficulty
- `.active` class shows current selection
- Event listeners in game.js:328-340 handle selection

Game over modal (index.html:53-57) is a fixed-position overlay that displays final score and replay button.

## Customization Points

To modify game difficulty, edit `SPEED_CONFIG` in game.js:18-39.
To change colors, edit `COLORS` object in game.js:42-49.
To adjust canvas size, modify canvas.width/height in game.js:6-7 and update CSS accordingly.
