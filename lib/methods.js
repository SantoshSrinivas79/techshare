/*global Tiles, Comments, Tags, Likes, Saved, Following, Notifications, invalidLink */

if (Meteor.isClient) {
    submitLink = function (captchaData, url, tag, category, callback) {
        Meteor.call('submitLink', captchaData, url, tag, category, callback);
    };
}

if (Meteor.isServer) {
    Meteor.methods({
        submitLink: function (captchaData, url, tags, category) {

            logger.info('New link posted by user: [' + Meteor.userId() + '], ' +
                'URL = [' + url + '], category = ' + category + ', tags = ' + tags);

            //Captcha verification first
            var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captchaData);

            if (!verifyCaptchaResponse.success) {
                logger.error('Captch verification failed for user : [' + Meteor.userId() + ']');
                throw new Meteor.Error('captcha-error', verifyCaptchaResponse.error);
            }

            //Number of tags validation
            if (!tags || tags.length === 0) {
                logger.error('Tag error- no tags provided by user: [' + Meteor.userId() + ']');
                throw new Meteor.Error('tag-error', 'Please provide at least 1 tag');
            }
            if (tags.length > 3) {
                logger.error('Tag error - more than 3 tags provided by user : [' + Meteor.userId() + ']');
                throw new Meteor.Error('tag-error', 'Maximum 3 tags allowed');
            }

            if (isEmpty(url)) {
                logger.error('Url error - Empty URL provided by user : [' + Meteor.userId() + ']');
                throw new Meteor.Error('url-error', 'Please provide a valid url');
            }

            if (invalidLink(url)) {
                logger.error('Url error - Invalid URL provided by user : [' + Meteor.userId() + ']');
                throw new Meteor.Error('url-error', 'Please provide a valid url');
            }

            var result;
            try {
                result = HTTP.get('https://api.embedly.com/1/oembed', {
                    params: {
                        url: url,
                        key: '',
                    }
                });
            } catch (error) {
                console.log(error);
                logger.error('Call to url + ' + url + ' failed for user : [' + Meteor.userId() + ']');
                throw new Meteor.Error('url-error', "An error occurred while fetching link info. Please retry");
            }

            Tiles.find({url: url}).forEach(function (tile) {
                var posted = tile.posted;
                var currentTime = new Date();
                var diffInMs = currentTime.getTime() - posted.getTime();
                var diffInSec = diffInMs / 1000;
                var diffInMinutes = Math.floor(diffInSec / 60);
                var diffInHours = Math.floor(diffInMinutes / 60);
                if (diffInHours <= 24) {
                    logger.error('Duplicate link posted by user : ' + Meteor.userId() + ']');
                    throw new Meteor.Error('url-error', 'This link has already been posted in last 24 hours');
                }
            });

            var tile = {
                url: url,
                title: result.data.title,
                description: result.data.description,
                thumbnail_url: result.data.thumbnail_url,
                tags: tags,
                category: category,
                author: {
                    id: Meteor.userId(),
                    name: Meteor.user().profile.name,
                    pic: Meteor.user().profile.pic,
                    slug: Meteor.user().slug
                }
            };

            Tiles.insert(tile);
            tags.forEach(function (tag) {
                Tags.update({name: tag}, {$inc: {linkCount: 1}});
            });
        },
        sendVerificationEmail: function (userId) {
            logger.info("Sending verification email for userId:" + userId);
            Accounts.sendVerificationEmail(userId);
        },
        sendEmail: function (to, from, subject, username) {
            //check([to, from, subject, text], [String]);

            // Let other method calls from the same client start running,
            // without waiting for the email sending to complete.
            this.unblock();

            Mailer.send({
                to: to,
                subject: subject,
                template: 'welcome',
                data: {
                    username: username
                }
            });
        },
        clientLog: function (logLevel, message) {
            logger[logLevel](message);
        }
    });
}

Meteor.methods({
    deleteTile: function (tileId) {
        Meteor.call('clientLog', 'info', 'DeleteTile called by user: [' + Meteor.userId() + '] for tile: ' + tileId);
        var tile = Tiles.findOne({_id: tileId});
        if (tile) {
            Tiles.remove({_id: tileId});
            Likes.remove({tileId: tileId});
            Comments.remove({tileSlug: tile.slug, parentId: {$exists: false}});
            tile.tags.forEach(function (tag) {
                Tags.update({name: tag, linkCount: {$gte: 1}}, {$inc: {linkCount: -1}});
            });
        }
    },
    saveTile: function (tileId) {
        Meteor.call('clientLog', 'info', 'SaveTile called by user: [' + Meteor.userId() + '] for tile: ' + tileId);
        if (Meteor.user()) {
            Saved.insert({userSlug: Meteor.user().slug, tileId: tileId});
        }
    },
    likeTile: function (tileId) {
        Meteor.call('clientLog', 'info', 'LikeTile called by user: [' + Meteor.userId() + '] for tile: ' + tileId);
        if (Likes.find({tileId: tileId, userSlug: Meteor.user().slug}).count() === 0) {
            Tiles.update({_id: tileId}, {$inc: {likeCount: 1}});
            Likes.insert({userId: Meteor.userId(), tileId: tileId});
            var tile = Tiles.findOne({_id: tileId});

            if (Meteor.userId() !== tile.author.id) {
                Notifications.insert({
                    action: "liked",
                    actor: {
                        name: Meteor.user().profile.name,
                        id: Meteor.userId(),
                        pic: Meteor.user().profile.pic
                    },
                    receiver: {
                        id: tile.author.id
                    },
                    read: false,
                    tile: {
                        id: tileId,
                        url: tile.url,
                        title: tile.title
                    },
                    date: new Date()
                });
            }
        }
    },
    unlikeTile: function (tileId) {
        Meteor.call('clientLog', 'info', 'UnlikeTile called by user: [' + Meteor.userId() + '] for tile: ' + tileId);
        if (Likes.find({tileId: tileId}).count() > 0) {
            Likes.remove({userId: Meteor.userId(), tileId: tileId});
            Tiles.update({_id: tileId}, {$inc: {likeCount: -1}});
        }
    },
    postComment: function (tileId, text, parentId) {
        Meteor.call('clientLog', 'info', 'PostComment called by user: [' + Meteor.userId() + '] for tile: ' + tileId + " Comment text = [" + text + "]");

        var tile = Tiles.findOne({_id: tileId}),
            comment = {
                tileId: tileId,
                tileSlug: tile.slug,
                text: text,
                author: {
                    id: Meteor.userId(),
                    name: Meteor.user().profile.name,
                    pic: Meteor.user().profile.pic
                }
            };

        if (parentId && parentId.trim().length > 0) {
            comment.parentId = parentId;

            if (Meteor.userId() !== tile.author.id) {
                Notifications.insert({
                    action: "replied",
                    actor: {
                        id: Meteor.userId(),
                        name: Meteor.user().profile.name,
                        pic: Meteor.user().profile.pic
                    },
                    receiver: {
                        id: tile.author.id
                    },
                    read: false,
                    tile: {
                        id: tile._id,
                        url: tile.url,
                        title: tile.title
                    },
                    content: text,
                    date: new Date()
                });
                Meteor.call('clientLog', 'info', 'Notification for reply inserted. Actor: ' + Meteor.userId() + ", Receiver: " + tile.author.id + ", tile:" + tileId);
            }
        }

        Comments.insert(comment);
        Tiles.update({_id: tile._id}, {$inc: {commentCount: 1}});

        if (Meteor.userId() !== tile.author.id) {
            Notifications.insert({
                action: "commented",
                actor: {
                    id: Meteor.userId(),
                    name: Meteor.user().profile.name,
                    pic: Meteor.user().profile.pic
                },
                receiver: {
                    id: tile.author.id
                },
                read: false,
                tile: {
                    id: tile._id,
                    url: tile.url,
                    title: tile.title
                },
                content: text,
                date: new Date()
            });
            Meteor.call('clientLog', 'info', 'Notification for comment inserted. Actor: ' + Meteor.userId() + ", Receiver: " + tile.author.id + ", tile:" + tileId);
        }
    },
    deleteComment: function (commentId) {
        Meteor.call('clientLog', 'info', 'DeleteComment called by user: [' + Meteor.userId() + '] for comment: ' + commentId);
        Comments.remove({_id: commentId});
    },
    saveTile: function (tileId) {
        Meteor.call('clientLog', 'info', 'SaveTile called by user: [' + Meteor.userId() + '] for tile: ' + tileId);
        if (Saved.find({tileId: tileId}).count() === 0) {
            Saved.insert({tileId: tileId, userSlug: Meteor.user().slug});
        }
    },
    followTag: function (tagName) {
        Meteor.call('clientLog', 'info', 'FollowTag called by user: [' + Meteor.userId() + '] for tag: ' + tagName);
        if (Following.find({userSlug: Meteor.user().slug, tagName: tagName}).count() === 0) {
            Following.insert({userSlug: Meteor.user().slug, tagName: tagName});
            Tags.update({name: tagName}, {$inc: {followerCount: 1}});
        }
    },
    unfollowTag: function (tagName) {
        Meteor.call('clientLog', 'info', 'UnfollowTag called by user: [' + Meteor.userId() + '] for tag: ' + tagName);
        if (Following.find({userSlug: Meteor.user().slug, tagName: tagName}).count() > 0) {
            Following.remove({userSlug: Meteor.user().slug, tagName: tagName});
            Tags.update({name: tagName, followerCount: {$gte: 1}}, {$inc: {followerCount: -1}});
        }
    },
    markAllAsRead: function () {
        Meteor.call('clientLog', 'info', 'MarkAllAsRead called by user : [' + Meteor.userId() + ']');
        Notifications.update({"receiver.id": Meteor.userId(), read: false}, {$set: {read: true}}, {multi: true});
    },

    registerUser: function (user) {
        Meteor.call('clientLog', 'info', 'New user being registered : [' + user + ']');
        var userId = Accounts.createUser(user);
        Meteor.call('sendVerificationEmail', userId, function (error) {
            if (error) {
                Meteor.call('clientLog', 'error', 'Error in sending verification email for user : [' + user + ']');
                return throwError(error.error, error.reason);
            }
        });
    }
});

Comments.before.remove(function (userId, comment) {
    var replyCount = Comments.find({parentId: comment._id}).count();
    if (replyCount > 0) {
        Comments.remove({parentId: comment._id});
    }
    Tiles.update({_id: comment.tileId}, {$inc: {commentCount: -1}});
});
