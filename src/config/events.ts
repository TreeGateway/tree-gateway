'use strict';

/**
 * Topics used to publish config related events.
 */
export class ConfigTopics {
    public static BASE_TOPIC = '{config}:events';
    public static CONFIG_UPDATED = `${ConfigTopics.BASE_TOPIC}:config-updated`;
    public static CIRCUIT_CHANGED = `${ConfigTopics.BASE_TOPIC}:circuitbreaker:changed`;
}

export class ConfigEvents {
    public static CONFIG_UPDATED = `configUpdated`;
    public static CIRCUIT_CHANGED = `circuitbreakerChanged`;
}
