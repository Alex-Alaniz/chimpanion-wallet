# Chimpanion Logo Setup

## Current Setup
A placeholder SVG logo is currently being used (`chimpanion-logo-placeholder.svg`). It's a simple, friendly chimp face design.

## To Add Your Official Logo

1. **Create your logo file** as `chimpanion-logo.png` in this public folder
   - Recommended size: 128x128px or larger (square aspect ratio)
   - Format: PNG with transparent background

2. **Update the references** in these files:
   - `src/components/ChimpanionMainPage.tsx` - Line ~94
   - `src/components/ChimpanionLandingPage.tsx` - Line ~16  
   - `src/lib/privy.ts` - Line ~19

3. **Replace** `/chimpanion-logo-placeholder.svg` with `/chimpanion-logo.png`

## Logo Usage Locations
- Landing page header
- Main dashboard header  
- Privy authentication modal
- Loading screens

The logo is displayed at 32x32px (w-8 h-8) in most places. 