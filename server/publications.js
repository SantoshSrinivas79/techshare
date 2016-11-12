Meteor.publish('tiles', function (selector, options) {
    return Tiles.find(selector, options);
});

Meteor.publish('comments', function (tileId) {
    return Comments.find({tileId: tileId});
});

Meteor.publish('commentsBySlug', function (tileSlug) {
    return Comments.find({tileSlug: tileSlug});
});

Meteor.publish('tile', function (tileId) {
    return Tiles.find({_id: tileId});
});

Meteor.publish('tileBySlug', function (slug) {
    return Tiles.find({slug: slug});
});

Meteor.publish('tags', function () {
    return Tags.find({});
});

Meteor.publish('likesForUser', function (userId) {
    return Likes.find({userId: userId});
});

Meteor.publish('following', function (slug) {
    return Following.find({userSlug: slug});
});

Meteor.publish('notifications', function (userId) {
    return Notifications.find({"receiver.id": userId});
});

Meteor.publish('usertiles', function (userId) {
    return Tiles.find({'author.id': userId});
});

Meteor.publish('usertilesBySlug', function (slug) {
    return Tiles.find({'author.slug': slug});
});

Meteor.publish('userinfo', function (userId) {
    return Meteor.users.find({_id: userId}, {fields: {_id: 1, profile: 1, slug: 1}});
});

Meteor.publish('userinfoBySlug', function (slug) {
    return Meteor.users.find({slug: slug}, {fields: {_id: 1, profile: 1, slug: 1}});
});

Meteor.publish('saved', function (userId) {
    return Saved.find({userId: userId});
});

//Publishing extra fields for user
Meteor.publish(null, function() {
    if (this.userId) {
        return Meteor.users.find(
            {_id: this.userId},
            {fields: {slug: 1}});
    } else {
        return null;
    }
}, {is_auto: true});