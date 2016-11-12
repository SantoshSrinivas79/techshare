/**
 * Created by vaibhav1 on 3/5/16.
 */

Meteor.startup(function() {
    reCAPTCHA.config({
        privatekey: Meteor.settings.private.captchaKey
    });
});