module.exports = class Event {
    constructor(streamId, eventId, message, payload) {
        if (!streamId || eventId === undefined || !message || !payload) {
            throw new Error(`Event: missing the following parameters 
                ${!streamId ? 'streamId, ' : ''}${!eventId ? 'eventId, ' : ''}
                ${!message ? 'message, ' : ''}${!payload ? 'payload' : ''}.`);
        }
        this.streamId = streamId;
        this.eventId = eventId;
        this.message = message;
        this.payload = payload;
    }
    
    static fromObject(obj) {
        const streamId = obj.streamId || obj.StreamId;
        let eventId = obj.eventId;
        if (eventId === undefined || eventId === null)
            eventId = obj.EventId;
        const message = obj.message || obj.Message;
        const payload = obj.payload || obj.Payload;
        return new Event(streamId, eventId, message, payload);
    }
};
