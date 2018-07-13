'use strict';

export abstract class PluginsDataService {
    public abstract listConfigurationItems(configKey: string): Promise<Array<string>>;
    public abstract addConfigurationItem(configKey: string, value: string): Promise<void>;
    public abstract on(event: string | symbol, listener: (...args: Array<any>) => void): this;
    public abstract removeListener(event: string | symbol, listener: (...args: Array<any>) => void): this;
    public abstract removeAllListeners(event?: string | symbol): this;
    public abstract watchConfigurationItems(configKey: string, interval: number): NodeJS.Timer;
    public abstract stopWatchingConfigurationItems(watcherKey: NodeJS.Timer): void;
}
