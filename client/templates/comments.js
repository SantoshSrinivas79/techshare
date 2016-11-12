Template.comments.helpers({
    comments: function () {
        var count =  Comments.find({tileId: this._id, parentId: {$exists: false}}, {sort: {posted: -1}}).count();
        return Comments.find({tileId: this._id, parentId: {$exists: false}}, {sort: {posted: -1}});
    }
});

Template.comments.events({
    "click #submit-comment": function (evt, template) {
        evt.preventDefault();
        evt.stopPropagation();
        var commentText = template.$('#input-comment').val();
        if (commentText.trim().length > 0) {
            Meteor.call('postComment', this._id, commentText, null, function (error) {
                if(error) {
                    showTopLevelError(error.reason);
                }
            });
            template.$('#input-comment').val("");
        }
    }
});

Template.comment.helpers({
    subComments: function () {
        return Comments.find({parentId: this._id}, {sort: {posted: 1}});
    }
});

Template.comment.events({
    "click .reply-btn": function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var $replyBox = $(evt.target).closest('.comment-footer').find('.input-reply');
        if ($replyBox.is(":visible")) {
            $replyBox.hide();
        } else {
            $replyBox.show();
        }
    },
    "click .delete-btn": function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var commentId = $(evt.target).closest('.comment').data('id');
        var tileId = Router.current().params._tileId;
        Meteor.call('deleteComment', commentId, tileId, function (error) {
            if (error) {
                showTopLevelError("An error occurred while deleting comment. Please retry");
            }
        });
    },
    "click .post-reply": function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var $replyBoxContainer = $(evt.target).closest('.input-reply');
        var $replyBox = $replyBoxContainer.children('textarea:first');

        var reply = $replyBox.val();
        var parentId = $(evt.target).data('parent-id');
        var tileSlug = Router.current().params._slug,
            tile = Tiles.findOne({slug: tileSlug});

        if (!isEmpty(reply)) {
            Meteor.call('postComment', tile._id, reply, parentId, function (error) {
                if (error) {
                    showTopLevelError(error.reason);
                    return;
                }
                $replyBox.val('');
                $replyBoxContainer.slideUp("slow");
            });
        }
    },
    "click .cancel-reply": function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        $(evt.target).closest('.input-reply').hide();
    }
});