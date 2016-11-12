/**
 * Created by vaibhav1 on 6/25/16.
 */

Template.banner.events({
    "click .remove": function (evt, tmpl) {
        evt.stopPropagation();
        tmpl.$('#banner').remove();
    },
    "click .login-btn": function () {
        console.log('Btn clicked');
        $('#loginModal').modal("show");
    }
});
