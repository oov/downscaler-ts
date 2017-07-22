import { imul } from './math';
import { ImageDataLike, ImageDataGeneric } from './imagedata';

export class Gamma16 {
    readonly table: Uint16Array;
    readonly revTable: Uint8Array;
    constructor(g: number) {
        const u16 = new Uint16Array(256);
        for (let i = 0; i < 256; ++i) {
            u16[i] = Math.pow(i / 255, g) * 65535 | 0;
        }
        this.table = u16;

        g = 1.0 / g;
        const u8 = new Uint8Array(65536);
        for (let i = 0; i < 65536; ++i) {
            u8[i] = Math.pow(i / 65535, g) * 255 | 0;
        }
        this.revTable = u8;
    }

    apply(src: ImageDataLike): ImageDataGeneric<Uint16Array> {
        const dest: ImageDataGeneric<Uint16Array> = {
            width: src.width,
            height: src.height,
            data: new Uint16Array(src.data.length)
        };
        const table = this.table;
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

    restore(src: ImageDataGeneric<Uint16Array>, dest: ImageDataLike): void {
        const table = this.revTable;
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
}

export class Gamma32 {
    readonly table: Float32Array;
    constructor(g: number) {
        const table = new Float32Array(256);
        for (let i = 0; i < 256; ++i) {
            table[i] = Math.pow(i / 255, g);
        }
        this.table = table;
    }

    private reverseLookup(v: number): number {
        const table = this.table;
        let l = 0, c: number, r = table.length - 1;
        while (r - l > 1) {
            c = (l + r) >> 1;
            if (table[c] <= v) {
                l = c;
            } else {
                r = c;
            }
        }
        if (v - table[l] <= table[r] - v) {
            return l;
        }
        return r;
    }

    apply(src: ImageDataLike): ImageDataGeneric<Float32Array> {
        const dest: ImageDataGeneric<Float32Array> = {
            width: src.width,
            height: src.height,
            data: new Float32Array(src.data.length)
        };
        const table = this.table;
        const s = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.length);
        const d = dest.data;
        const len = src.data.length;
        for (let i = 0; i < len; i += 4) {
            d[i + 0] = table[s[i + 0]];
            d[i + 1] = table[s[i + 1]];
            d[i + 2] = table[s[i + 2]];
            d[i + 3] = s[i + 3] / 255;
        }
        return dest;
    }

    restore(src: ImageDataGeneric<Float32Array>, dest: ImageDataLike): void {
        const s = src.data;
        const d = new Uint8Array(dest.data.buffer, dest.data.byteOffset, dest.data.length);
        const len = src.data.length;
        for (let i = 0; i < len; i += 4) {
            d[i + 0] = this.reverseLookup(s[i + 0]);
            d[i + 1] = this.reverseLookup(s[i + 1]);
            d[i + 2] = this.reverseLookup(s[i + 2]);
            d[i + 3] = s[i + 3] * 255 | 0;
        }
    }
}