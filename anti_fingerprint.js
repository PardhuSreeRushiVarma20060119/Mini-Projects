// anti_fingerprint.js
(function(){
  // small deterministic PRNG (xorshift)
  function xorshift(seed) {
    return function() {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return (seed >>> 0) / 4294967295;
    }
  }
  const seed = (Math.floor(Math.random()*1e9) ^ window.location.hostname.length) >>> 0;
  const rnd = xorshift(seed);

  const EPS = 2.0; // pixel noise amplitude (0-255). Tune small.

  // ---- Canvas 2D override ----
  try {
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args){
      try {
        const ctx = this.getContext('2d');
        if (ctx) {
          const w = this.width, h = this.height;
          const img = ctx.getImageData(0,0,w,h);
          for (let i=0;i<64;i++){
            const px = Math.floor(rnd()*w);
            const py = Math.floor(rnd()*h);
            const idx = (py*w+px)*4;
            img.data[idx] = Math.min(255, Math.max(0, img.data[idx] + (rnd()*2-1)*EPS));
            img.data[idx+1] = Math.min(255, Math.max(0, img.data[idx+1] + (rnd()*2-1)*EPS));
            img.data[idx+2] = Math.min(255, Math.max(0, img.data[idx+2] + (rnd()*2-1)*EPS));
          }
          ctx.putImageData(img,0,0);
        }
      } catch(e){}
      return toDataURL.apply(this, args);
    };
  }catch(e){}

  // ---- WebGL readPixels shim ----
  try {
    const proto = WebGLRenderingContext && WebGLRenderingContext.prototype;
    if (proto) {
      const readPixels = proto.readPixels;
      proto.readPixels = function(x,y,w,h,format,type,pixels, offset){
        try {
          readPixels.apply(this, arguments);
          if (pixels && pixels.length){
            const len = pixels.length;
            for (let i=0;i<Math.min(64, len); i++){
              const j = Math.floor(rnd()*len);
              if (typeof pixels[j] === 'number'){
                pixels[j] = pixels[j] + (rnd()*2-1)*(EPS/255.0);
              }
            }
          }
        } catch(e){}
      };
    }
  }catch(e){}

  // ---- Audio Analyser shim (optional) ----
  try {
    const AnalyserProto = window.AnalyserNode && window.AnalyserNode.prototype;
    if (AnalyserProto && AnalyserProto.getFloatTimeDomainData){
      const orig = AnalyserProto.getFloatTimeDomainData;
      AnalyserProto.getFloatTimeDomainData = function(array){
        try {
          orig.call(this, array);
          for (let i=0;i<Math.min(array.length, 64); i++){
            const j = Math.floor(rnd()*array.length);
            array[j] = array[j] + (rnd()*2-1) * 1e-6; // tiny noise
          }
        } catch(e){}
      };
    }
  }catch(e){}
})();