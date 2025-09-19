# Fonts Directory

This directory contains the custom fonts for the Oui, Chef app.

## Required Font Files

### Recoleta (Headers)
- Recoleta-Bold.ttf
- Recoleta-Regular.ttf
- Recoleta-Medium.ttf

### Nunito Sans (Body Text)
- NunitoSans-Regular.ttf
- NunitoSans-Medium.ttf
- NunitoSans-SemiBold.ttf
- NunitoSans-Bold.ttf

## How to Add Fonts

1. Download the font files from:
   - Recoleta: https://www.recoletatype.com/
   - Nunito Sans: https://fonts.google.com/specimen/Nunito+Sans

2. Place the .ttf files in this directory

3. The app.json is already configured to load these fonts

4. Restart the development server after adding fonts

## Font Usage in Code

```javascript
// Headers (Recoleta)
fontFamily: 'Recoleta-Bold'
fontFamily: 'Recoleta-Regular'

// Body Text (Nunito Sans)
fontFamily: 'NunitoSans-Regular'
fontFamily: 'NunitoSans-Medium'
fontFamily: 'NunitoSans-SemiBold'
fontFamily: 'NunitoSans-Bold'
```

