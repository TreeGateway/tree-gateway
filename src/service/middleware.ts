'use strict';

export abstract class MiddlewareService {
    public abstract list(middleware: string, filter?: string): Promise<Array<string>>;
    public abstract add(middleware: string, name: string, content: Buffer): Promise<string>;
    public abstract remove(middleware: string, name: string): Promise<void>;
    public abstract update(middleware: string, name: string, content: Buffer, upsert?: boolean): Promise<void>;
    public abstract read(middleware: string, name: string): Promise<Buffer>;
}
