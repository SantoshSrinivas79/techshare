/**
 * Created by vaibhav1 on 3/19/16.
 */
Template.userprofile.helpers({

    userinfo: function () {
        return Meteor.users.findOne({slug: Router.current().params._slug});
    },
    numPosts: function () {
        return Tiles.find({'author.slug': Router.current().params._slug}).count();
    },
    userPostsActive: function () {
        var currentRouteName = Router.current().route.getName();
        if (currentRouteName === 'userprofile' || currentRouteName === 'userprofileposts') {
            return 'active';
        }
        return '';
    },
    userFollowingActive: function () {
        var currentRouteName = Router.current().route.getName();
        if (currentRouteName === 'userprofilefollowing') {
            return 'active';
        }
        return '';
    },
    userSavedActive: function () {
        var currentRouteName = Router.current().route.getName();
        if (currentRouteName === 'userprofilesaved') {
            return 'active';
        }
        return '';
    }
});

Template.userTiles.helpers({
    tiles: function () {

        var selector,
            options = {sort: {posted: -1}};

        if (Router.current().route.getName() === 'userprofilesaved') {
            var savedTiles = [];
            Saved.find({userId: Router.current().params._userId}).forEach(function (saved) {
                savedTiles.push(saved.tileId);
            });
            selector = {_id: {$in: savedTiles}};
        } else {
            selector = {'author.slug': Router.current().params._slug};
        }
        return Tiles.find(selector, options);
    }
});


