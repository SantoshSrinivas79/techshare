isEmpty = function (input) {
    return (!input || input.trim().length === 0);
};


invalidLink = function (_link) {
    if (!_link) {
        return true;
    }
    var link = _link.trim();

    if (link.length === 0) {
        return true;
    }

    if (link.indexOf('http://') !== 0 && link.indexOf('https://') !== 0) {
        return true;
    }

    if (link.indexOf('"') > -1) {
        return true;
    }

    if (link.indexOf(' ') > -1) {
        return true;
    }

    return false;
};

throwError = function(error, reason, details) {
    var meteorError = new Meteor.Error(error, reason, details);

    if (Meteor.isClient) {
        // this error is never used
        // on the client, the return value of a stub is ignored
        return meteorError;
    } else if (Meteor.isServer) {
        throw meteorError;
    }
};