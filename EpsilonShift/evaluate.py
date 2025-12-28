# evaluate.py
# Usage: python evaluate.py snapshots.json

import sys
import json
from difflib import SequenceMatcher


def str_similarity(a,b):
    return SequenceMatcher(None, a or '', b or '').ratio()


def evaluate(path):
    data = json.load(open(path))
    pre = data['pre']
    post = data['post']
    res = {'ua_sim': 1.0 if pre.get('ua') == post.get('ua') else 0.0,
           'platform_sim': 1.0 if pre.get('platform') == post.get('platform') else 0.0,
           'plugin_diff': abs((pre.get('plugins') or 0) - (post.get('plugins') or 0)),
           'canvas_sim': str_similarity(pre.get('canvas'), post.get('canvas')),
           'gpu_sim': 1.0 if pre.get('gpu') == post.get('gpu') else 0.0}
    # composite: weighted (canvas heavy)
    res['composite'] = (0.4*res['canvas_sim'] + 0.2*res['ua_sim'] + 0.2*res['platform_sim'] + 0.2*res['gpu_sim'])
    print(json.dumps(res, indent=2))

if __name__ == '__main__':
    evaluate(sys.argv[1])
