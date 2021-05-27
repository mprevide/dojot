package com.github.dojot.keycloak.kafka;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Message to be published on Kafka
 */
class Message {

    private Map<String, Object> metadata;
    private Map<String, String> type;
    private Map<String, String> tenant;

    public Message() {
        metadata = new LinkedHashMap<>();
        type = new LinkedHashMap<>();
        tenant = new LinkedHashMap<>();
    }

    public Message(Map<String, Object> metadata, Map<String, String> type, Map<String, String> tenant) {
        this.metadata = metadata;
        this.type = type;
        this.tenant = tenant;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public Map<String, String> getType() {
        return type;
    }

    public void setType(Map<String, String> type) {
        this.type = type;
    }

    public Map<String, String> getTenant() {
        return tenant;
    }

    public void setTenant(Map<String, String> tenant) {
        this.tenant = tenant;
    }


}
