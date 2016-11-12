/**
 * Created by vaibhav1 on 5/28/16.
 */
Template.submenu.onCreated(function () {
    Session.set('selectedCategory', 'All');
    Session.set('selectedSort', 'New');
});

Template.submenu.helpers({
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
    },
    currentPath: function () {
        return Iron.Location.get().pathname;
    },
    selectedCategory: function () {
        return Session.get('selectedCategory');
    },
    selectedSort: function () {
        return Session.get('selectedSort');
    },
    queryParam: function () {
        var sortCriteria = Session.get('selectedSort');
        return "?sort_by=" + sortCriteria.toLowerCase();
    }
});

Template.submenu.events({
    "click #categories-menu a": function (evt, tmpl) {
        var cat = $(evt.currentTarget).data('cat');
        if (cat) {
            Session.set('selectedCategory', cat);
            //Session.set('selectedSort', "New"); //TODO: Fix this. Sort criteria shouldn't change
        }
    },
    "click #sort-menu a": function (evt, tmpl) {

        var sort = $(evt.currentTarget).data('sort');
        if (sort) {
            Session.set('selectedSort', sort);
        }
    }
});
