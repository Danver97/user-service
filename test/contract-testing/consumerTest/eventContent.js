const pact = require('@pact-foundation/pact');

const { like, term } = pact.Matchers;
const likeUuid = pact.Matchers.uuid;

function basicEvent(streamId, eventId, message, payload){
    return {
        streamId: likeUuid(streamId),
        eventId: like(eventId),
        message,
        payload,
    };
}

function userCreatedEvent(user) {
    return basicEvent(user.id, 1, 'userCreated', {
        // TODO
    });
}

module.exports = {
    userCreatedEvent,
};
