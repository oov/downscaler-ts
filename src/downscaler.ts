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
const imul = Math.imul ? Math.imul : imulPolyfill;

// http://stackoverflow.com/a/17445307
function gcd(a: number, b: number): number {
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

function lcm(a: number, b: number): number {
    return imul(a, b) / gcd(a, b);
}

interface ImageDataLike {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}

interface TypedArray {
    buffer: ArrayBuffer;
    byteOffset: number;
    length: number;
    [index: number]: number;
}

interface ImageDataGeneric {
    width: number;
    height: number;
    data: TypedArray;
}

function horz8(src: ImageDataLike, dest: ImageDataLike): void {
    const s = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.length);
    const d = new Uint8Array(dest.data.buffer, dest.data.byteOffset, dest.data.length);

    const sw = src.width, dw = dest.width;
    const lcmlen = lcm(sw, dw) | 0;
    const slcmlen = lcmlen / sw | 0;
    const dlcmlen = lcmlen / dw | 0;

    const tt = new Int32Array(dw + 1);
    const ft = new Int32Array(dw + 1);
    for (let i = 0; i <= dw; ++i) {
        ft[i] = imul(dlcmlen, i + 1) % slcmlen;
        tt[i] = imul(dlcmlen, i) / slcmlen | 0;
    }

    const dh = dest.height;
    const swx4 = src.width << 2, dwx4 = dest.width << 2;
    for (let y = 0; y < dh; ++y) {
        let di = imul(y, dwx4);
        let si = imul(y, swx4);
        for (let x = 0, fr = 0; x < dw; ++x) {
            const tl = tt[x], tr = tt[x + 1];
            const fl = slcmlen - fr;
            fr = ft[x];
            let a = 0, r = 0, g = 0, b = 0, w = 0;
            if (fl !== 0) {
                w = imul(s[si + 3], fl);
                r += imul(s[si + 0], w);
                g += imul(s[si + 1], w);
                b += imul(s[si + 2], w);
                a += w;
                si += 4;
            }
            for (let i = tl + 1; i < tr; ++i) {
                w = imul(s[si + 3], slcmlen);
                r += imul(s[si + 0], w);
                g += imul(s[si + 1], w);
                b += imul(s[si + 2], w);
                a += w;
                si += 4;
            }
            if (fr !== 0) {
                w = imul(s[si + 3], fr);
                r += imul(s[si + 0], w);
                g += imul(s[si + 1], w);
                b += imul(s[si + 2], w);
                a += w;
            }
            if (a === 0) {
                d[di + 0] = 0;
                d[di + 1] = 0;
                d[di + 2] = 0;
                d[di + 3] = 0;
            } else {
                d[di + 0] = r / a | 0;
                d[di + 1] = g / a | 0;
                d[di + 2] = b / a | 0;
                d[di + 3] = a / dlcmlen | 0;
            }
            di += 4;
        }
    }
}

function vert8(src: ImageDataGeneric, dest: ImageDataGeneric): void {
    const s = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.length);
    const d = new Uint8Array(dest.data.buffer, dest.data.byteOffset, dest.data.length);

    const sh = src.height, dh = dest.height;
    const lcmlen = lcm(sh, dh);
    const slcmlen = lcmlen / sh | 0;
    const dlcmlen = lcmlen / dh | 0;

    const tt = new Int32Array(dh + 1);
    const ft = new Int32Array(dh + 1);
    for (let i = 0; i <= dh; ++i) {
        ft[i] = imul(dlcmlen, i + 1) % slcmlen;
        tt[i] = imul(dlcmlen, i) / slcmlen | 0;
    }

    const swx4 = src.width << 2, dwx4 = dest.width << 2;
    for (let x = 0; x < dwx4; x += 4) {
        let di = x;
        let si = x;
        for (let y = 0, fr = 0; y < dh; ++y) {
            const tl = tt[y], tr = tt[y + 1];
            const fl = slcmlen - fr;
            fr = ft[y];
            let a = 0, r = 0, g = 0, b = 0, w = 0;
            if (fl !== 0) {
                w = imul(s[si + 3], fl);
                r += imul(s[si + 0], w);
                g += imul(s[si + 1], w);
                b += imul(s[si + 2], w);
                a += w;
                si += swx4;
            }
            for (let i = tl + 1; i < tr; ++i) {
                w = imul(s[si + 3], slcmlen);
                r += imul(s[si + 0], w);
                g += imul(s[si + 1], w);
                b += imul(s[si + 2], w);
                a += w;
                si += swx4;
            }
            if (fr !== 0) {
                w = imul(s[si + 3], fr);
                r += imul(s[si + 0], w);
                g += imul(s[si + 1], w);
                b += imul(s[si + 2], w);
                a += w;
            }
            if (a === 0) {
                d[di + 0] = 0;
                d[di + 1] = 0;
                d[di + 2] = 0;
                d[di + 3] = 0;
            } else {
                d[di + 0] = r / a | 0;
                d[di + 1] = g / a | 0;
                d[di + 2] = b / a | 0;
                d[di + 3] = a / dlcmlen | 0;
            }
            di += dwx4;
        }
    }
}

function horz16(src: ImageDataGeneric, dest: ImageDataGeneric): void {
    const s = src.data;
    const d = dest.data;

    const sw = src.width, dw = dest.width;
    const lcmlen = lcm(sw, dw) | 0;
    const slcmlen = lcmlen / sw | 0;
    const dlcmlen = lcmlen / dw | 0;

    const tt = new Int32Array(dw + 1);
    const ft = new Int32Array(dw + 1);
    for (let i = 0; i <= dw; ++i) {
        ft[i] = imul(dlcmlen, i + 1) % slcmlen;
        tt[i] = imul(dlcmlen, i) / slcmlen | 0;
    }

    const dh = dest.height;
    const swx4 = src.width << 2, dwx4 = dest.width << 2;
    for (let y = 0; y < dh; ++y) {
        let di = imul(y, dwx4);
        let si = imul(y, swx4);
        for (let x = 0, fr = 0; x < dw; ++x) {
            const tl = tt[x], tr = tt[x + 1];
            const fl = slcmlen - fr;
            fr = ft[x];
            let a = 0, r = 0, g = 0, b = 0, w = 0;
            if (fl !== 0) {
                w = s[si + 3] * fl;
                r += s[si + 0] * w;
                g += s[si + 1] * w;
                b += s[si + 2] * w;
                a += w;
                si += 4;
            }
            for (let i = tl + 1; i < tr; ++i) {
                w = s[si + 3] * slcmlen;
                r += s[si + 0] * w;
                g += s[si + 1] * w;
                b += s[si + 2] * w;
                a += w;
                si += 4;
            }
            if (fr !== 0) {
                w = s[si + 3] * fr;
                r += s[si + 0] * w;
                g += s[si + 1] * w;
                b += s[si + 2] * w;
                a += w;
            }
            if (a === 0) {
                d[di + 0] = 0;
                d[di + 1] = 0;
                d[di + 2] = 0;
                d[di + 3] = 0;
            } else {
                d[di + 0] = r / a;
                d[di + 1] = g / a;
                d[di + 2] = b / a;
                d[di + 3] = a / dlcmlen;
            }
            di += 4;
        }
    }
}

function vert16(src: ImageDataGeneric, dest: ImageDataGeneric): void {
    const s = src.data;
    const d = dest.data;

    const sh = src.height, dh = dest.height;
    const lcmlen = lcm(sh, dh);
    const slcmlen = lcmlen / sh | 0;
    const dlcmlen = lcmlen / dh | 0;

    const tt = new Int32Array(dh + 1);
    const ft = new Int32Array(dh + 1);
    for (let i = 0; i <= dh; ++i) {
        ft[i] = imul(dlcmlen, i + 1) % slcmlen;
        tt[i] = imul(dlcmlen, i) / slcmlen | 0;
    }

    const swx4 = src.width << 2, dwx4 = dest.width << 2;
    for (let x = 0; x < dwx4; x += 4) {
        let di = x;
        let si = x;
        for (let y = 0, fr = 0; y < dh; ++y) {
            const tl = tt[y], tr = tt[y + 1];
            const fl = slcmlen - fr;
            fr = ft[y];
            let a = 0, r = 0, g = 0, b = 0, w = 0;
            if (fl !== 0) {
                w = s[si + 3] * fl;
                r += s[si + 0] * w;
                g += s[si + 1] * w;
                b += s[si + 2] * w;
                a += w;
                si += swx4;
            }
            for (let i = tl + 1; i < tr; ++i) {
                w = s[si + 3] * slcmlen;
                r += s[si + 0] * w;
                g += s[si + 1] * w;
                b += s[si + 2] * w;
                a += w;
                si += swx4;
            }
            if (fr !== 0) {
                w = s[si + 3] * fr;
                r += s[si + 0] * w;
                g += s[si + 1] * w;
                b += s[si + 2] * w;
                a += w;
            }
            if (a === 0) {
                d[di + 0] = 0;
                d[di + 1] = 0;
                d[di + 2] = 0;
                d[di + 3] = 0;
            } else {
                d[di + 0] = r / a;
                d[di + 1] = g / a;
                d[di + 2] = b / a;
                d[di + 3] = a / dlcmlen;
            }
            di += dwx4;
        }
    }
}

function makeGammaTable8to16(g: number): Uint16Array {
    const r = new Uint16Array(256);
    for (let i = 0; i < 256; ++i) {
        r[i] = Math.pow(i / 255, g) * 65535 | 0;
    }
    return r;
}

function makeGammaTable16to8(g: number): Uint8Array {
    const r = new Uint8Array(65536);
    for (let i = 0; i < 65536; ++i) {
        r[i] = Math.pow(i / 65535, g) * 255 | 0;
    }
    return r;
}

function applyGamma(src: ImageDataLike, g: number): ImageDataGeneric {
    const table = makeGammaTable8to16(g);
    const dest: ImageDataGeneric = {
        width: src.width,
        height: src.height,
        data: new Uint16Array(src.data.length)
    };
    const s = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.length);
    const d = dest.data;
    const len = src.data.length;
    for (let i = 0; i < len; i += 4) {
        d[i + 0] = table[s[i + 0]];
        d[i + 1] = table[s[i + 1]];
        d[i + 2] = table[s[i + 2]];
        d[i + 3] = imul(s[i + 3], 0x101);
    }
    return dest;
}

function restoreGamma(src: ImageDataGeneric, g: number, dest: ImageDataLike): void {
    const table = makeGammaTable16to8(g);
    const s = src.data;
    const d = new Uint8Array(dest.data.buffer, dest.data.byteOffset, dest.data.length);
    const len = src.data.length;
    for (let i = 0; i < len; i += 4) {
        d[i + 0] = table[s[i + 0]];
        d[i + 1] = table[s[i + 1]];
        d[i + 2] = table[s[i + 2]];
        d[i + 3] = s[i + 3] >> 8;
    }
}

export function scale(src: ImageDataLike, dest: ImageDataLike, gamma?: number): void {
    if (src.width < dest.width || src.height < dest.height) {
        throw new Error('upscale is not supported');
    }
    if (src.width === dest.width && src.height === dest.height) {
        const s = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.length);
        const d = new Uint8Array(dest.data.buffer, dest.data.byteOffset, dest.data.length);
        const len = src.data.length;
        for (let i = 0; i < len; ++i) {
            d[i] = s[i];
        }
        return;
    }
    if (gamma !== undefined) {
        return scaleWithGamma(src, dest, gamma);
    }
    if (src.height !== dest.height) {
        if (src.width !== dest.width) {
            const tmp: ImageDataLike = {
                width: dest.width,
                height: src.height,
                data: new Uint8ClampedArray(imul(dest.width << 2, src.height))
            };
            horz8(src, tmp);
            vert8(tmp, dest);
        } else {
            vert8(src, dest);
        }
    } else {
        horz8(src, dest);
    }
}

function scaleWithGamma(src: ImageDataLike, dest: ImageDataLike, gamma: number): void {
    const src16 = applyGamma(src, gamma);
    const dest16: ImageDataGeneric = {
        width: dest.width,
        height: dest.height,
        data: new Uint16Array(dest.data.length)
    };
    if (src.height !== dest.height) {
        if (src.width !== dest.width) {
            const tmp: ImageDataGeneric = {
                width: dest.width,
                height: src.height,
                data: new Uint16Array(imul(dest.width << 2, src.height))
            };
            horz16(src16, tmp);
            vert16(tmp, dest16);
        } else {
            vert16(src16, dest16);
        }
    } else {
        horz16(src16, dest16);
    }
    restoreGamma(dest16, 1.0 / gamma, dest);
}