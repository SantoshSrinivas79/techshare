/**
 * Created by vaibhav1 on 1/30/16.
 */

/*Test*/
Tiles = new Mongo.Collection('tiles');
Comments = new Mongo.Collection('comments');
Tags = new Mongo.Collection('tags');
Likes = new Mongo.Collection('likes');
Saved = new Mongo.Collection('saved');
Following = new Mongo.Collection('following');
Notifications = new Mongo.Collection('notifications');

Tiles.friendlySlugs({
    slugFrom: 'title',
    slugField: 'slug',
    distinct: true,
    updateSlug: true
});

Meteor.users.friendlySlugs({
    slugFrom: 'profile.name',
    slugField: 'slug',
    distinct: true,
    updateSlug: true
});

TilesSchema = new SimpleSchema({
    url: {
        type: String,
        label: "URL"
    },
    title: {
        type: String,
        label: "Title",
        denyUpdate: true
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    thumbnail_url: {
        type: String,
        optional: true
    },
    tags: {
        type: [String],
        label: "Tags"
    },
    category: {
        type: String,
        label: "Category"
    },
    likeCount: {
        type: Number,
        label: "Number of likes",
        defaultValue: 0
    },
    commentCount: {
        type: Number,
        label: "Number of comments",
        defaultValue: 0
    },
    "author.id": {
        type: String,
        label: "Author Id",
        autoValue: function () {
            return this.userId;
        },
        denyUpdate: false
    },
    "author.name": {
        type: "String",
        label: "Author name",
        denyUpdate: false
    },
    "author.pic": {
        type: "String",
        label: "Author's picture",
        denyUpdate: false
    },
    "author.slug": {
        type: "String",
        label: "Author's slug",
        denyUpdate: false
    },
    posted: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            }
        }
    }
});

Tiles.attachSchema(TilesSchema);

CommentsSchema = new SimpleSchema({
    tileId: {
        type: String
    },
    tileSlug: {
        type: String
    },
    parentId: {
        type: String,
        optional: true
    },
    text: {
        type: String,
        label: "Comment text",
        max: 300
    },
    "author.id": {
        type: String,
        label: "Author Id",
        autoValue: function () {
            return this.userId;
        },
        denyUpdate: false
    },
    "author.name": {
        type: "String",
        label: "Author name",
        denyUpdate: false
    },
    "author.pic": {
        type: "String",
        label: "Author's picture",
        denyUpdate: false
    },
    posted: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            }
        },
        denyUpdate: true
    }
});

Comments.attachSchema(CommentsSchema);

TagsSchema = new SimpleSchema({
    name: {
        type: "String"
    },
    followerCount: {
        type: Number,
        defaultValue: 0
    },
    linkCount: {
        type: Number,
        defaultValue: 0
    }
});

Tags.attachSchema(TagsSchema);

NotificationsSchema = new SimpleSchema({
    action: {
        type: String,
        allowedValues: ["replied", "commented"]
    },
    "actor.id": {
        type: String
    },
    "actor.name": {
        type: String
    },
    "actor.pic": {
        type: String
    },
    "receiver.id": {
        type: String
    },
    read: {
        type: Boolean
    },
    "tile.id": {
        type: String
    },
    "tile.url": {
        type: String
    },
    "tile.title": {
        type: String
    },
    content: {
        type: String
    },
    date: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            }
        },
        denyUpdate: true
    }
});

Notifications.attachSchema(NotificationsSchema);

FollowingSchema = new SimpleSchema({
    userSlug: {
        type: String
    },
    tagName: {
        type: String
    }
});

Following.attachSchema(FollowingSchema);

SavedSchema = new SimpleSchema({
    userSlug: {
        type: String
    },
    tileId: {
        type: String
    }
});

Saved.attachSchema(SavedSchema);
