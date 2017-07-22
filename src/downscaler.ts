import { imul, lcm } from './math';
import { ImageDataLike, TypedArray, ImageDataGeneric } from './imagedata';

export function copy<T extends TypedArray>(src: ImageDataGeneric<T>, dest: ImageDataGeneric<T>): void {
    const s = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.byteLength);
    const d = new Uint8Array(dest.data.buffer, dest.data.byteOffset, dest.data.byteLength);
    const len = src.data.length;
    for (let i = 0; i < len; ++i) {
        d[i] = s[i];
    }
}

export function horz8(src: ImageDataLike, dest: ImageDataLike): void {
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

export function horz<T extends TypedArray>(src: ImageDataGeneric<T>, dest: ImageDataGeneric<T>): void {
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

export function vert8(src: ImageDataLike, dest: ImageDataLike): void {
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

export function vert<T extends TypedArray>(src: ImageDataGeneric<T>, dest: ImageDataGeneric<T>): void {
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