# shadow_puppeteer.py
# Usage: python shadow_puppeteer.py --target <URL> --out snaps.json

import argparse
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

FINGERPRINT_JS = """() => {
  const fp = {};
  fp.ua = navigator.userAgent;
  fp.platform = navigator.platform;
  fp.plugins = navigator.plugins ? navigator.plugins.length : 0;
  try {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 50;
    const ctx = c.getContext('2d');
    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillText("fp-test-"+Math.random().toString(36).slice(2), 2, 2);
    fp.canvas = c.toDataURL().slice(0,200);
  } catch(e){ fp.canvas = "err"; }
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
    fp.gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "unknown";
  } catch(e){ fp.gpu = "err"; }
  return fp;
}"""

INIT_SCRIPT_FILENAME = 'anti_fingerprint.js'


def collect_snapshot(page):
    return page.evaluate(FINGERPRINT_JS)


def run(target, out_path, headless=True):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()
        page.goto(target, wait_until='networkidle')
        snap_pre = collect_snapshot(page)

        context.close()
        context = browser.new_context()
        # add init script
        init_js = Path(INIT_SCRIPT_FILENAME).read_text()
        context.add_init_script(init_js)
        page = context.new_page()
        page.goto(target, wait_until='networkidle')
        snap_post = collect_snapshot(page)

        browser.close()
        out = {'target': target, 'pre': snap_pre, 'post': snap_post, 'timestamp': time.time()}
        Path(out_path).write_text(json.dumps(out, indent=2))
        print(f"Saved snapshots to {out_path}")


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--target', required=True)
    ap.add_argument('--out', default='snapshots.json')
    ap.add_argument('--no-headless', dest='headless', action='store_false')
    args = ap.parse_args()
    run(args.target, args.out, headless=args.headless)