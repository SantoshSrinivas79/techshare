Template.header.events({
    "click [data-action='login-popup']": function (evt) {
        evt.preventDefault();
        $('#loginModal').modal("show");
    },
    "click #nav-logout": function (evt) {
        evt.preventDefault();
        Meteor.logout();
    },
    "click #add-link": function () {
        if (Meteor.userId()) {
            $('#submitModal').modal("show");
            $('#link-form-group input').focus();

        } else {
            $('#loginModal').modal("show");
        }
    },
    "focus #search-input": function (evt) {
        $('#search-form-group').css('border-color', '#2e9fff');
        Session.set('showSuggestions', true);
    },
    "blur #search-input": function (evt) {
        $('#search-form-group').css('border-color', '#ccc');
        setTimeout(function () {
            Session.set('showSuggestions', false);
        }, 300);
    },
    "keyup #search-input": function (evt) {
        Session.set('showSuggestions', true);
        var q = $(evt.target).val();
        //console.log('searchQuery = ' + q);
        Session.set('searchQuery', q);
    },
    "click .typeahead li": function (evt, tmpl) {
        Session.set('showSuggestions', true);
        var tagName = $(evt.target).text();
        var duplicate = false;
        tmpl.$('.selected-tag').each(function () {
            if ($(this).text() === tagName) {
                $(this).css('border', '1px solid red');
                var elm = $(this);
                setTimeout(function () {
                    elm.css('border', 'none');
                }, 1300);
                duplicate = true;
                return false;
            }
        });

        if (duplicate) {
            Session.set('searchQuery', '');
            return false;
        }

        $cross = $('<i></i>').addClass('fa').addClass('fa-times-circle').addClass('remove-tag');
        $('<span></span>')
            .addClass('selected-tag')
            .text(tagName)
            .appendTo('#selected-search-tag-list')
            .append($cross);


        var inputTagWidth = $('#search-form-group').width() - $('#selected-search-tag-list').width() - 20;
        $('#search-input').css('width', inputTagWidth + 'px');

        $('#search-input').val('');
        $('#search-input').focus();

        $('#selected-search-tag-list').animate({scrollLeft: 150}, 300);
        Session.set('searchQuery', '');
    },
    "submit #search-form": function (evt, tmpl) {
        evt.preventDefault();
        evt.stopPropagation();
        var searchTerms = [];
        tmpl.$('.selected-tag').each(function () {
            searchTerms.push($(this).text());
        });
        Router.go('/search/' + searchTerms.join('+'));
    },
    "click .selected-tag .remove-tag": function (evt) {
        $(evt.target).parent().remove();
        var inputTagWidth = $('#search-form-group').width() - $('#selected-search-tag-list').width() - 20;
        $('#search-input').css('width', inputTagWidth + 'px');
        $('#search-input').focus();
    }
});

Template.header.helpers({
    activeRouteClass: function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.pop();

        var active = _.any(args, function (name) {
            return Router.current() && Router.current().route.getName() === name;
        });

        return active && 'active';
    },
    notificationCount: function () {
        return Notifications.find({"receiver.id": Meteor.userId(), read: false}).count();
    },
    suggestedTags: function () {
        var q = Session.get('searchQuery');
        if (!isEmpty(q)) {
            var numMatches = Tags.find({name: {$regex: q, $options: 'i'}}).count();
            if (numMatches > 0) {
                return Tags.find({name: {$regex: q, $options: 'i'}}, {limit: 6});
            }
        }
    },
    showSuggestions: function(){
        //console.log('showsugestions = ' + Session.get('showSuggestions'));
        return Session.get('showSuggestions');
    }
});