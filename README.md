# Mini Projects 
This file provides guidance to **Mini Projects** when working with code or files in this repository.

## Repository Structure

This repository serves as an index for **mini-projects** in a scripting and automation collection. The actual project code lives in sibling directories outside this Git repository:

- **Mini-Projects/** (current directory): Git repository serving as an index/catalog
- **../Shadow_Puppeteer/**: Adversarial anti-fingerprinting research prototype using Python and Playwright

## Project Architecture

### Shadow_Puppeteer
A browser fingerprinting defense research tool with the following components:
- **Python Playwright harness** (`shadow_puppeteer.py`): Collects browser fingerprints before/after JavaScript injection
- **JavaScript injection code** (`anti_fingerprint.js`): Injects adversarial perturbations into Canvas, WebGL, and Audio APIs
- **Evaluation module** (`evaluate.py`): Computes similarity metrics to measure fingerprint changes
- **Local test page** (`testsite.html`): Simple HTML page for local testing

## Common Development Commands

### Shadow_Puppeteer Setup and Testing
```powershell
# Navigate to the project directory
cd ..\Shadow_Puppeteer

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies and browsers
pip install -r requirements.txt
playwright install

# Start local test server (in one terminal)
python -m http.server 8000

# Run the fingerprint collection (in another terminal)
python shadow_puppeteer.py --target http://localhost:8000/testsite.html --out snaps.json

# Evaluate results
python evaluate.py snaps.json

# Run with visible browser for debugging
python shadow_puppeteer.py --target http://localhost:8000/testsite.html --out snaps.json --no-headless
```

### Single Test Commands
```powershell
# Quick end-to-end test
cd ..\Shadow_Puppeteer
python shadow_puppeteer.py --target https://example.com --out test_results.json
python evaluate.py test_results.json
```

## Key Configuration Parameters

### JavaScript Injection Tuning (anti_fingerprint.js)
- **EPS**: Pixel amplitude perturbation (default: 2.0, range: 0-8)
- **Perturbation count**: Number of pixels to modify (default: 64, can increase to 256)
- **Audio noise amplitude**: Tiny noise added to audio fingerprints (default: 1e-6)

### Evaluation Metrics
- **canvas_sim**: Canvas similarity score (lower = more change, target < 0.5)
- **composite**: Weighted aggregate score (target < 0.6 for meaningful fingerprint change)
- **gpu_sim**: WebGL renderer string change detection (1 = same, 0 = different)

## Development Workflow

1. **Setup**: Create virtual environment and install dependencies
2. **Local Testing**: Use testsite.html with local server for quick iterations
3. **Parameter Tuning**: Modify EPS and perturbation counts in anti_fingerprint.js
4. **Evaluation**: Run multiple trials and analyze similarity metrics
5. **Visual Verification**: Use --no-headless flag to ensure UX isn't broken

## Project Navigation

Since actual projects are in sibling directories, use relative paths:
- Current repository: `./` 
- Shadow_Puppeteer project: `../Shadow_Puppeteer/`
- To return to index: `cd ../Mini Projects/Mini-Projects/`

## Safety Notes

- Only test on websites you own or have explicit permission to test
- This is a privacy defense research prototype - use ethically
- Keep perturbations conservative on sites with critical canvas usage (editors, games)
- Visual artifacts may occur with high EPS values - reduce if needed
