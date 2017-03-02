"use strict";

/**
 * Topics used to publish config related events.
 */
export class ConfigTopics {
    static BASE_TOPIC = '{config}:events'
    static API_ADDED = `${ConfigTopics.BASE_TOPIC}:api-added`;
    static API_REMOVED = `${ConfigTopics.BASE_TOPIC}:api-removed`;
    static API_UPDATED = `${ConfigTopics.BASE_TOPIC}:api-updated`;
    static MIDDLEWARE_ADDED = `${ConfigTopics.BASE_TOPIC}:middleware-added`;
    static MIDDLEWARE_REMOVED = `${ConfigTopics.BASE_TOPIC}:middleware-removed`;
    static MIDDLEWARE_UPDATED = `${ConfigTopics.BASE_TOPIC}:middleware-updated`;
}

export class ConfigEvents {
    static API_ADDED = `apiAdded`;
    static API_REMOVED = `apiRemoved`;
    static API_UPDATED = `apiUpdated`;
}