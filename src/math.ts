// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/imul#Polyfill
function imulPolyfill(a: number, b: number): number {
    const ah = (a >>> 16) & 0xffff;
    const al = a & 0xffff;
    const bh = (b >>> 16) & 0xffff;
    const bl = b & 0xffff;
    // the shift by 0 fixes the sign on the high part
    // the final |0 converts the unsigned value into a signed value
    return al * bl + (((ah * bl + al * bh) << 16) >>> 0) | 0;
}
export const imul = Math.imul ? Math.imul : imulPolyfill;

// http://stackoverflow.com/a/17445307
export function gcd(a: number, b: number): number {
    if (a === 0) {
        return b;
    }
    while (b !== 0) {
        if (a > b) {
            a -= b;
        } else {
            b -= a;
        }
    }
    return a;
}

export function lcm(a: number, b: number): number {
    return imul(a, b) / gcd(a, b);
}