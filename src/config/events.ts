'use strict';

/**
 * Topics used to publish config related events.
 */
export class ConfigTopics {
    static BASE_TOPIC = '{config}:events';
    static CONFIG_UPDATED = `${ConfigTopics.BASE_TOPIC}:config-updated`;
    static CIRCUIT_CHANGED = `${ConfigTopics.BASE_TOPIC}:circuitbreaker:changed`;
}

export class ConfigEvents {
    static CONFIG_UPDATED = `configUpdated`;
    static CIRCUIT_CHANGED = `circuitbreakerChanged`;
}
