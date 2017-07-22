export interface TypedArray {
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
    length: number;
    [index: number]: number;
}

export interface ImageDataGeneric<T extends TypedArray> {
    width: number;
    height: number;
    data: T;
}

export interface ImageDataLike extends ImageDataGeneric<Uint8ClampedArray> {}