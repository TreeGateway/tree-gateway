"use strict";

/**
 * The API config descriptor.
 */
export interface GatewayConfig {
    rootPath: string;
    apiPath: string;
    middlewarePath: string;
    logger?: LoggerConfig;
    database?: RedisConfig;
}

export interface RedisConfig {
    host: string;
    port: number;
}

export interface LoggerConfig {
    level?: string;
    console?: LogConsoleConfig;
    file?: LogFileConfig;
}

export interface LogConsoleConfig {
    colorize?: boolean;
    timestamp?: boolean;
}

export interface LogFileConfig {
    filename?: string;
    timestamp?: boolean;
}

export enum LogLevel {
    error, info, debug
}