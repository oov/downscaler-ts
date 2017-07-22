import { imul } from './src/math';
import { ImageDataLike } from './src/imagedata';
import { copy, vert, vert8, horz, horz8 } from './src/downscaler';
import { Gamma16, Gamma32 } from './src/gamma';

export function scaleGamma32(src: ImageDataLike, dest: ImageDataLike, g: number): void {
    if (src.width < dest.width || src.height < dest.height) {
        throw new Error('upscale is not supported');
    }
    if (src.width === dest.width && src.height === dest.height) {
        copy(src, dest);
        return;
    }
    const gamma = new Gamma32(g);
    const tmpSrc = gamma.apply(src);
    const tmpDest = {
        width: dest.width,
        height: dest.height,
        data: new Float32Array(dest.data.length)
    };
    if (src.height !== dest.height) {
        if (src.width !== dest.width) {
            const tmp = {
                width: dest.width,
                height: src.height,
                data: new Float32Array(imul(dest.width << 2, src.height))
            };
            horz(tmpSrc, tmp);
            vert(tmp, tmpDest);
        } else {
            vert(tmpSrc, tmpDest);
        }
    } else {
        horz(tmpSrc, tmpDest);
    }
    gamma.restore(tmpDest, dest);
}

export function scaleGamma16(src: ImageDataLike, dest: ImageDataLike, g: number): void {
    if (src.width < dest.width || src.height < dest.height) {
        throw new Error('upscale is not supported');
    }
    if (src.width === dest.width && src.height === dest.height) {
        copy(src, dest);
        return;
    }
    const gamma = new Gamma16(g);
    const tmpSrc = gamma.apply(src);
    const tmpDest = {
        width: dest.width,
        height: dest.height,
        data: new Uint16Array(dest.data.length)
    };
    if (src.height !== dest.height) {
        if (src.width !== dest.width) {
            const tmp = {
                width: dest.width,
                height: src.height,
                data: new Uint16Array(imul(dest.width << 2, src.height))
            };
            horz(tmpSrc, tmp);
            vert(tmp, tmpDest);
        } else {
            vert(tmpSrc, tmpDest);
        }
    } else {
        horz(tmpSrc, tmpDest);
    }
    gamma.restore(tmpDest, dest);
}

export function scaleNoGamma(src: ImageDataLike, dest: ImageDataLike): void {
    if (src.width < dest.width || src.height < dest.height) {
        throw new Error('upscale is not supported');
    }
    if (src.width === dest.width && src.height === dest.height) {
        copy(src, dest);
        return;
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
export function scale(src: ImageDataLike, dest: ImageDataLike, g?: number): void {
    if (g === undefined) {
        return scaleNoGamma(src, dest);
    }
    scaleGamma16(src, dest, g);
}