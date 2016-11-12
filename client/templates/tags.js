Template.tags.helpers({
    tags: function () {
        var selector = {};

        if (Router.current().route.getName() === 'userprofilefollowing') {
            var followingTags = [];
            Following.find({userId: Router.current().params._userId}).forEach(function (following) {
                followingTags.push(following.tagName);
            });
            selector = {name: {$in: followingTags}};
        }

        var filterText = Session.get('tag-filter');
        if (filterText && filterText.length > 0) {
            _.extend(selector, {name: {$regex: filterText, $options: 'i'}});
        }
        return Tags.find(selector, {sort: {linkCount: -1}});
    },
    isTagSelected: function (tagName) {
        return Router.current().params._tag === tagName;
    },
    followerCount: function () {
        var followerCount = this.followerCount;
        if (followerCount) {
            if (followerCount < 1000) {
                return followerCount;
            }
            followerCount = Math.round((followerCount / 1000) * 10) / 10;
            return followerCount + "K";
        }
        return 0;
    },
    followed: function () {
        if (Following.find({tagName: this.name, userSlug: Meteor.user().slug}).count() > 0) {
            Session.set(this.name, true);
            return true;
        }
        return false;
    },
    encode: function (text) {
        return encodeURIComponent(text);
    }
});

Template.tags.events({
    "keyup #input-tag-filter": function (evt) {
        var filterText = $(evt.target).val();
        if (filterText && filterText.length > 0) {
            Session.set('tag-filter', filterText.toLowerCase());
        } else {
            Session.set('tag-filter', '');
        }
    },
    "click .follow-btn": function (evt) {
        var tagName = $(evt.target).data('tag');
        if (Session.get(tagName)) {
            Meteor.call('unfollowTag', tagName, function (error) {
                if (error) {
                    showTopLevelError("An unknown error occurred");
                }
                Session.set(tagName, false);
            });
        } else {
            Meteor.call('followTag', tagName, function (error) {
                if (error) {
                    showTopLevelError("An unknown error occurred");
                }
                Session.set(tagName, true);
            });
        }
    }
});


