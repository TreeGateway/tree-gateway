/**
 * Topics used to publish config related events.
 */
export class ConfigTopics {
    static BASE_TOPIC = 'config:events'
    static API_ADDED = `${ConfigTopics.BASE_TOPIC}:api-added`;
    static API_REMOVED = `${ConfigTopics.BASE_TOPIC}:api-removed`;
    static API_UPDATED = `${ConfigTopics.BASE_TOPIC}:api-updated`;
}