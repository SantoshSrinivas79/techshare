/**
 * Created by vaibhav1 on 2/5/16.
 */

Template.submitLink.onRendered(function () {
    $('#link-form-group input').focus();
    Session.set('addLinkErrors', {});
});

var validateLink = function (link) {

    var errors = {};
    if (isEmpty(link.url)) {
        errors.url = "Please provide a link/URL";
        return errors;
    }

    if (invalidLink(link.url)) {
        errors.url = "Invalid link. Please provide a valid link";
        return errors;
    }

    if (link.tags.length === 0) {
        errors.tags = "Please provide a tag";
        return errors;
    }
    if (link.tags.length > 3) {
        errors.tags = "Maximum 3 tags are allowed";
        return errors;
    }

    if (!link.captchaData || link.captchaData.length === 0) {
        errors.captcha = "Please verify that you\'re not a robot";
        return errors;
    }
};

Template.submitLink.events({
    "focus #input-tag": function () {
        $('#input-tag-container').css('border-color', '#66afe9');
    },
    "blur #input-tag": function () {
        $('#input-tag-container').css('border-color', '#ccc');
    },
    "click #submitLink": function (evt, template) {
        evt.preventDefault();
        evt.stopPropagation();
        var url = template.$('[name="inputLink"]').val(),
            category = $('#inputCategory').val(),
            tags = [],
            captchaData = grecaptcha.getResponse();
        $('.selected-tag').each(function () {
            tags.push($(this).text());
        });

        var link = {
            url: url,
            category: category,
            tags: tags,
            captchaData: captchaData
        };
        var errors = validateLink(link);
        Session.set("addLinkErrors", errors);

        if (!_.isEmpty(errors)) {
            return;
        }

        Session.set("waitForSubmit", true);

        submitLink(captchaData, url, tags, category, function (error) {
            Session.set("waitForSubmit", false);
            grecaptcha.reset();

            if (error) {
                console.log(error);
                if (error.error === 'url-error') {
                    Session.set('addLinkErrors', {url: error.reason});
                    return;
                }

                if(error.error === 'tag-error') {
                    Session.set('addLinkErrors', {tag: error.reason});
                    return;
                }

                if(error.error === 'captcha-error') {
                    Session.set('addLinkErrors', {captcha: error.reason});
                    return;
                }

                Session.set('addLinkErrors', {internal: 'An internal error occurred. Please retry'});

                Meteor.call('clientLog', 'error', JSON.stringify(error));
                return;
            }

            template.$('[name="inputLink"]').val("");
            $('#inputTag').val("");
            $('#submitModal').modal("hide");
            template.$('.selected-tag').remove();
            Session.set('addLinkErrors', {});
        });
    },
    "keyup #input-tag": function (evt) {
        var q = $(evt.target).val();
        Session.set('typeaheadQuery', q);
    },
    "click .typeahead li": function (evt, tmpl) {
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
            Session.set('typeaheadQuery', '');
            return false;
        }

        $cross = $('<i></i>').addClass('fa').addClass('fa-times-circle').addClass('remove-tag');
        $('<span></span>')
            .addClass('selected-tag')
            .text(tagName)
            .appendTo('#selected-tag-list')
            .append($cross);


        var inputTagWidth = $('#input-tag-container').width() - $('#selected-tag-list').width() - 20;
        $('#input-tag').css('width', inputTagWidth + 'px');

        $('#input-tag').val('');
        Session.set('typeaheadQuery', '');
    },
    "click .selected-tag .remove-tag": function (evt) {
        $(evt.target).parent().remove();
        $('#input-tag').focus();
    },
    "hidden.bs.modal #submitModal": function () {
        Session.set('addLinkErrors', {});
    }

});

Template.submitLink.helpers({
    waitForSubmit: function () {
        return Session.get('waitForSubmit');
    },
    suggestedTags: function () {
        var q = Session.get('typeaheadQuery');
        if (!isEmpty(q)) {
            var numMatches = Tags.find({name: {$regex: q, $options: 'i'}}).count();
            if (numMatches > 0) {
                return Tags.find({name: {$regex: q, $options: 'i'}}, {limit: 6});
            }
        }
    },
    errorMessage: function (field) {
        var addLinkErrors =  Session.get('addLinkErrors');
        if(addLinkErrors) {
            var message = Session.get('addLinkErrors')[field];
            if (message) {
                return message;
            }
        }
        return '';
    }
});
