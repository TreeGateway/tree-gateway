'use strict';

export abstract class PluginsDataService {
    abstract listConfigurationItems(configKey: string): Promise<Array<string>>;
    abstract addConfigurationItem(configKey: string, value: string): Promise<void>;
    abstract on(event: string | symbol, listener: (...args: any[]) => void): this;
    abstract removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    abstract removeAllListeners(event?: string | symbol): this;
    abstract watchConfigurationItems(configKey: string, interval: number): NodeJS.Timer;
    abstract stopWatchingConfigurationItems(watcherKey: NodeJS.Timer): void;
}
