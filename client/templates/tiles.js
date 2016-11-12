/**
 * Created by vaibhav1 on 1/30/16.
 */

Template.tilesGrid.onCreated(function () {
    var instance = this;
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(6);

    instance.autorun(function () {
        var limit = instance.limit.get(),
            selector = Template.currentData().selector,
            options = Template.currentData().options;

        options = _.extend(options, {
            limit: limit
        });
        var subscription = instance.subscribe('tiles', selector, options);

        if (subscription.ready()) {
            Session.set('loading', false);
            instance.loaded.set(limit);
        }
    });

    instance.tiles = function () {
        var selector = Template.currentData().selector;
        var options = Template.currentData().options;
        options = _.extend(options, {
            limit: instance.loaded.get()
        });
        return Tiles.find(selector, options);
    };

    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() === $(document).height()) {
            Session.set('loading', true);
            var currentLimit = instance.limit.get();
            instance.limit.set(currentLimit + 6);
        }
    });

});

Template.tilesGrid.helpers({
    tiles: function () {
        return Template.instance().tiles();
    },
    feedEmpty: function () {
        if (Router.current() && Router.current().route.getName().indexOf('feed') > -1) {
            if (!Template.instance().tiles() || Template.instance().tiles().count() === 0) {
                return true;
            }
        }
        return false;
    },
    loading: function () {
        Session.get('loading');
    },
    currentPath: function () {
        return Iron.Location.get().pathname;
    }
});

Template.tile.onRendered(function () {
    var titleHeight = Template.instance().$('.title').outerHeight();
    var thumbHeight = (235.5 - titleHeight) + 'px';
    Template.instance().$('.thumb').css('height', thumbHeight);
});

Template.tile.events({
    'click .delete-tile': function () {
        Meteor.call('deleteTile', this._id);
    },
    'click .save-tile': function () {
        Meteor.call('saveTile', this._id);
    }
});

Template.tile.helpers({
    ownsTile: function () {
        if (Meteor.userId() === this.author.id) {
            return true;
        }
        return false;
    }
});

Template.tileFooter.events({
    'click .like': function () {
        if (Meteor.userId()) {
            if (isLiked(Meteor.userId(), this._id)) {
                Meteor.call('unlikeTile', this._id);
            } else {
                Meteor.call('likeTile', this._id);
            }
        }
    },
    "click .share-btn.fb": function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        FB.ui({
            method: 'feed',
            link: this.url
        }, function (response) {
        });
    }
});

Template.tileFooter.helpers({
    liked: function () {
        if (Meteor.userId()) {
            return isLiked(Meteor.userId(), this._id);
        }
        return false;
    },
    likeCountMod: function () {
        var likeCount = this.likeCount;
        if (likeCount < 1000) {
            return likeCount;
        }
        likeCount = Math.round((likeCount / 1000) * 10) / 10;
        return likeCount + "K";
    },
    commentCountMod: function () {
        var commentCount = this.commentCount;
        if (commentCount < 1000) {
            return commentCount;
        }

        commentCount = Math.round((commentCount / 1000) * 10) / 10;
        return commentCount + "K";
    },
    domain: function () {
        return extractDomain(this.url);
    }
});

var isLiked = function (userId, tileId) {
    if (Likes.find({userId: userId, tileId: tileId}).count() > 0) {
        return true;
    }
    return false;
};

//Template.tile.animations({
//    ".tile": {
//        animateInitial: true, // animate the intial elements
//        animateInitialStep: 200, // Step between each animation for each initial item
//        animateInitialDelay: 200,
//        container: ".tile-container", // container of the ".item" elements
//        insert: {
//            class: "fade-in", // class applied to inserted elements
//            before: function (attrs, element, template) {
//            }, // callback before the insert animation is triggered
//            after: function (attrs, element, template) {
//            }, // callback after an element gets inserted
//            delay: 500 // Delay before inserted items animate
//        },
//        remove: {
//            class: "fade-out", // class applied to removed elements
//            before: function (attrs, element, template) {
//            }, // callback before the remove animation is triggered
//            after: function (attrs, element, template) {
//            }, // callback after an element gets removed
//            delay: 500 // Delay before removed items animate
//        }
//    }
//});