Template.categories.helpers({
    tag: function () {
        return Router.current().params._tag || "all";
    },
    isSelected: function (cat) {
        return Router.current().params._cat === cat;
    },
    isSelectedAll: function () {
        if (Router.current().params._cat)
            return Router.current().params._cat === "all";
        return true;
    }
});

Template.categories.events({
    "click #logout": function () {
        Meteor.logout();
    }
});