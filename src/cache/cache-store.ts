'use strict';

export interface CacheEntry {
    mimeType: string;
    content: string;
}

export interface StoreCallback<T> {
    (err: any, value: T): void;
}

export interface CacheStore<T> {
    get(key: string, callback: StoreCallback<T>): void;

    set(key: string, value: T, maxAge?: number): void;

    del(key: string): void;
}
