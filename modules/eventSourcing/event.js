class Event {
    constructor(streamId, topic, message, payload) {
        if (!streamId || !topic || !message) {
            throw new Error(`Event - Missing the following constructor params: 
                ${streamId ? '' : 'streamId'} ${topic ? '' : 'topic'} ${message ? '' : 'message'}`);
        }
        this.streamId = streamId;
        this.topic = topic;
        this.message = message;
        this.payload = payload;
    }
}

module.exports = Event;
