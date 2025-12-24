# EpsilonShift — Adversarial Fingerprint Obfuscation via Sparse, Deterministic Canvas/WebGL/Audio Perturbations

A small research-grade prototype that injects tiny adversarial perturbations into browser fingerprinting APIs (Canvas, WebGL, Audio) via a Playwright Python harness and measures fingerprint differences before/after. Useful as a privacy-defense experiment and starting point for more advanced research.

---

## What this repo contains
- **`anti_fingerprint.js`** — JS code injected into pages to perturb canvas/WebGL/audio outputs.  
- **`shadow_puppeteer.py`** — Playwright Python harness: collects fingerprint snapshot before/after injection and saves JSON.  
- **`evaluate.py`** — Simple evaluator that computes similarity metrics (`canvas_sim`, `gpu_sim`, `composite`).  
- **`testsite.html`** — Tiny test page to run locally.  
- **`requirements.txt`** — Python dependencies.

## Design Note (Determinism vs. Realism) 

EpsilonShift applies session-scoped deterministic perturbations to browser fingerprinting surfaces. Each browser session initializes a deterministic PRNG seed, ensuring that perturbations remain stable within a session while varying across fresh sessions. This design reflects realistic privacy-defense constraints, preventing the perturbation pattern itself from becoming a stable fingerprint across sessions.

For controlled experimentation and reproducibility, the perturbation seed can be fixed, enabling identical perturbations across runs and supporting variance analysis. The current prototype prioritizes realism by default, with experimental determinism treated as a configurable mode.

**Threat Model:** The prototype targets passive browser fingerprinting techniques that rely on deterministic rendering and signal extraction, and does not attempt to evade active tracking, network-layer identifiers, or privileged browser instrumentation.

## NOTE (MUST READ)
This work provides an exploratory, open-source experimental scaffold for **studying fingerprint perturbation sensitivity**. The prototype focuses on **within-run** perturbation effects under realistic execution conditions. **Cross-run reproducibility and population-level analysis** are intentionally left to **downstream experimentation.**

---

## Quick Start (5 minutes)

1. **Create & activate a Python virtual environment:**
```bash
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

2. **Install dependencies and Playwright browsers:**
```bash
pip install -r requirements.txt
playwright install
```

3. **Serve the test page and run the harness:**
```bash
# From project root where sample_local_test.html exists
python -m http.server 8000

# In another terminal:
python shadow_puppeteer.py --target http://localhost:8000/testsite.html --out snaps.json
python evaluate.py snaps.json
```

You should see `snaps.json` created and `evaluate.py` will print similarity metrics.

---

## Files & Purpose

### `anti_fingerprint.js`
JS injected via Playwright `add_init_script`.  
Overrides/patches:
- `HTMLCanvasElement.prototype.toDataURL` (can extend to `toBlob` / `getImageData`)  
- `WebGLRenderingContext.prototype.readPixels` (sparse perturbations)  
- `AnalyserNode.getFloatTimeDomainData` (tiny audio noise)  

Uses a deterministic PRNG (xorshift) and configurable amplitude (**EPS**) and pixel count.

### `shadow_puppeteer.py`
- Launches Chromium, collects a fingerprint snapshot via a JS snippet (FINGERPRINT_JS)  
- Relaunches with `anti_fingerprint.js` added as an init script and collects a second snapshot  
- Writes a JSON file with pre and post snapshots  

### `evaluate.py`
- Loads the JSON and computes:
  - `ua_sim`, `platform_sim`, `plugin_diff`, `canvas_sim`, `gpu_sim`  
- Produces a composite weighted score  

---

## Command-line Usage
```bash
python shadow_puppeteer.py --target <URL> --out <FILE>
# Use --no-headless to run with visible browser
python shadow_puppeteer.py --target <URL> --out snaps.json --no-headless

python evaluate.py <SNAPS_JSON>
```

---

## Interpreting Metrics (Plain English)

- **canvas_sim (0..1)**: similarity of canvas image before vs after. *Lower = more change*.  
- **gpu_sim**: whether reported WebGL renderer string changed (1 = same, 0 = different).  
- **composite (0..1)**: weighted aggregate of all signals. *1 = unchanged; closer to 0 = altered fingerprint*.  

**Rule-of-thumb targets:**
- `canvas_sim < 0.5` — good canvas disruption  
- `composite < 0.6` — meaningful reduction across signals  

---

## Tuning & Experiments
Edit `anti_fingerprint.js`:

- **EPS** — pixel amplitude (default 2.0). Increase to 4–8 for stronger effect  
- **Perturbation loop count** (default 64). Increase to 256 to touch more pixels  

Re-run `shadow_puppeteer.py` and `evaluate.py` after changes.  
Run multiple trials to get mean/stddev — fingerprints may vary slightly per run.

---

## Headed Runs & Visual Checks
Use `--no-headless` to visually inspect pages and ensure perturbations do not break UX:
```bash
python shadow_puppeteer.py --target <URL> --out snaps.json --no-headless
```

Also consider capturing screenshots before/after and computing SSIM to verify visual fidelity.

---

## Safety & Ethics
- Only run this on pages you own or have **explicit permission** to test  
- This tool is a **privacy defense research prototype** — do not use to evade lawful monitoring or for illegal purposes  
- Keep perturbations conservative on sites with critical canvas usage (e.g., online editors or games)  

---

## Next Steps (Suggested Enhancements)
- Add `run_many.py` to run N trials per target and aggregate results (mean/std) into CSV  
- Add CLI flags to `shadow_puppeteer.py` to parametrize EPS and pixel count without editing JS  
- Create a simple adversarial optimizer (hill-climb) to maximize canvas hash change with minimal visual impact  
- Convert the injector to a browser extension for easier end-user testing  
- Integrate FingerprintJS collector for more realistic fingerprint features  

---

## Troubleshooting
- **FileNotFoundError reading `anti_fingerprint.js`**: run `shadow_puppeteer.py` from project root or update script to use `Path(__file__).parent`  
- **Playwright errors launching browser**: run `playwright install` and ensure Chromium is installed  
- **Visual artifacts after increasing EPS**: reduce EPS or fewer perturbed pixels  

---

## Example Output
```json
{
  "ua_sim": 1.0,
  "platform_sim": 1.0,
  "plugin_diff": 0,
  "canvas_sim": 0.455,
  "gpu_sim": 1.0,
  "composite": 0.782
}
```

### Interpretation:
Canvas was meaningfully changed (`canvas_sim = 0.455`) but the overall fingerprint still has many unchanged signals.

