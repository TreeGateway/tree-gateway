"use strict";

/**
 * Topics used to publish config related events.
 */
export class ConfigTopics {
    static BASE_TOPIC = '{config}:events'
    static CONFIG_UPDATED = `${ConfigTopics.BASE_TOPIC}:config-updated`;
}

export class ConfigEvents {
    static CONFIG_UPDATED = `configUpdated`;
}