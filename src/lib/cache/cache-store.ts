"use strict";

export interface CacheEntry{
    mimeType: string;
    content: string; 
}

export interface StoreCallback<T> {
    (err:any, value:T):void;
}

export interface CacheStore<T> {
    get(key, callback: StoreCallback<T>): void;

    set(key: any, value: T, maxAge?: number): void;

    del(key: any): void ;
}