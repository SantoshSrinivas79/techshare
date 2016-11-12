/**
 * Created by vaibhav1 on 1/30/16.
 */
Router.configure({
    layoutTemplate: 'layout',
    //notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    waitOn: function () {
        if (Meteor.user()) {
            return [Meteor.subscribe('tags'), Meteor.subscribe('likesForUser', Meteor.userId()),
                Meteor.subscribe('following', Meteor.user().slug), Meteor.subscribe('notifications', Meteor.userId())];
        } else {
            return [Meteor.subscribe('tags')];
        }
    }
});

Router.onBeforeAction(function () {
    //Session.keys = {};
    this.next();
});

Router.route('/verify-email/:token', {
    template: 'verifyEmail'
});

Router.route('/', {
    name: 'home',
    template: 'tiles-grid',
    data: function () {
        var options = {sort: {posted: -1}};
        if (this.params.query.sort_by === 'popular') {
            options = {sort: {likeCount: -1}};
        }
        return {
            selector: {},
            options: options
        };
    }
});

Router.route('/tags', {
    name: 'tags'
});

Router.route('/tags/:_tag', {
    action: function () {
        var route = '/tags/' + encodeURIComponent(this.params._tag) + '/category/all';
        if (this.params.query.sort_by) {
            route = route + '?sort_by=' + this.params.query.sort_by;
        }
        Router.go(route);
    }
});

Router.route('/tags/:_tag/category/:_cat/', {
    template: 'tiles-grid',
    data: function () {
        var selector = '';

        var options = {sort: {posted: -1}};
        if (this.params.query.sort_by) {
            if (this.params.query.sort_by === 'popular') {
                options = {sort: {likeCount: -1}};
            } else {
                options = {sort: {posted: -1}};
            }
        }

        if (this.params._tag === 'all') {
            if (this.params._cat.toLowerCase() === 'all') {
                selector = {};
            } else {
                selector = {category: this.params._cat};
            }
        } else {
            if (this.params._cat.toLowerCase() === 'all') {
                selector = {tags: this.params._tag};
            } else {
                selector = {tags: this.params._tag, category: this.params._tag};
            }
        }

        return {
            selector: selector,
            options: options
        };
    }
});

Router.route('/:_slug/comments', {
    name: 'viewComments',
    waitOn: function () {
        return [Meteor.subscribe('commentsBySlug', this.params._slug),
            Meteor.subscribe('tileBySlug', this.params._slug)];
    },
    data: function () {
        return Tiles.findOne({slug: this.params._slug});
    },
    onAfterAction: function () {
        var tile = this.data();
        // The SEO object is only available on the client.
        // Return if you define your routes on the server, too.
        if (!Meteor.isClient) {
            return;
        }
        if (tile) {
            SEO.set({
                title: tile.title,
                meta: {
                    'description': tile.description
                },
                og: {
                    'title': tile.title,
                    'description': tile.description
                }
            });
        }
    }
});

Router.route('/reset-password/:_token', {
    name: "resetPassword"
});

Router.route('/notifications', {
    name: "notifications",
    onAfterAction: function () {
        Meteor.call('markAllAsRead', function (error) {
        });
    }
});


FeedController = RouteController.extend({
    name: 'feed',
    template: 'tiles-grid',
    data: function () {
        var tags = [];
        if (Meteor.user() && Meteor.user().slug) {
            Following.find({userSlug: Meteor.user().slug}).forEach(function (following) {
                tags.push(following.tagName);
            });
        }
        return {
            selector: {tags: {$in: tags}},
            options: {sort: {posted: -1}}
        };
    }
});

Router.route('/feed', {
    controller: FeedController
});

PopularFeedController = FeedController.extend({
    data: function () {
        var tags = [];
        Following.find({userId: Meteor.userId()}).forEach(function (following) {
            tags.push(following.tagName);
        });
        return {
            selector: {tags: {$in: tags}},
            options: {sort: {likeCount: -1}}
        };
    }
});

Router.route('/feed/popular', {
    controller: PopularFeedController
});


UserProfileController = RouteController.extend({
    layoutTemplate: 'userProfileLayout',
    template: 'userTiles',
    waitOn: function () {
        return [Meteor.subscribe('usertilesBySlug', this.params._slug),
            Meteor.subscribe('userinfo', this.params._userId)];
    }
});

Router.route('/user/:_slug', {
    name: 'userprofile',
    controller: UserProfileController
});

Router.route('/user/:_slug/posts', {
    name: 'userprofileposts',
    controller: UserProfileController
});

Router.route('/user/:_slug/following', {
    name: 'userprofilefollowing',
    layoutTemplate: 'userProfileLayout',
    template: 'tags',
    waitOn: function () {
        return [Meteor.subscribe('usertilesBySlug', this.params._slug),
            Meteor.subscribe('following', this.params._slug)];
    }
});

UserSavedController = UserProfileController.extend({
    waitOn: function () {
        return [Meteor.subscribe('saved', this.params._slug)];
    }
});

Router.route('/user/:_slug/saved', {
    name: 'userprofilesaved',
    controller: UserSavedController,
});


Router.route('/search/:_query', {
    name: 'search',
    template: 'tiles-grid',
    data: function () {
        var searchTerms = this.params._query.split(' ');
        return {
            selector: {tags: {$all: searchTerms}},
            options: {sort: {posted: -1}}
        };
    }
});

Router.route('/about', {
    name: 'about'
});