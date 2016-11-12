/**
 * Created by vaibhav1 on 3/12/16.
 */

Template.notifications.helpers({
    notifications: function () {
        return Notifications.find({"receiver.id": Meteor.userId()}, {sort: {date: -1}});
    }
});

Template.notification.helpers({
    actionDetail: function () {
        if (this.action === "liked") {
            return "liked your link ";
        }
        if (this.action === "replied") {
            return "replied to your comment on the link ";
        }
        if (this.action === "commented") {
            return "commented on your link ";
        }
    },
    commented: function () {
        return this.action === "commented" || this.action === "replied";
    }
});
