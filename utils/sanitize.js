function isObject(v) { return v && typeof v === 'object' && !Array.isArray(v); }
const SENSITIVE_KEYS = new Set(['password','pass','pwd','token','authorization','auth','secret','otp','apiKey','accessToken','refreshToken','clientSecret']);
function maskValue(v) {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string') return v.length <= 4 ? '****' : v.slice(0,2) + '****' + v.slice(-2);
  if (typeof v === 'number' || typeof v === 'boolean') return '****';
  if (Array.isArray(v)) return v.map(maskValue);
  if (isObject(v)) return sanitizePayload(v);
  return '****';
}
function sanitizePayload(input) {
  if (!isObject(input) && !Array.isArray(input)) return input;
  const out = Array.isArray(input) ? [] : {};
  for (const [k,v] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(k.toString())) out[k] = maskValue(v);
    else if (isObject(v) || Array.isArray(v)) out[k] = sanitizePayload(v);
    else out[k] = v;
  }
  return out;
}
module.exports = { sanitizePayload };
