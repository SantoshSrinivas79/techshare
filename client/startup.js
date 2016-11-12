/**
 * Created by vaibhav1 on 3/22/16.
 */

Meteor.startup(function () {
    reCAPTCHA.config({
        publickey: Meteor.settings.public.captchaKey
    });

    return SEO.config({
        title: 'TechShare',
        meta: {
            'description': 'Techshare - A social network to share and discover information about software and programming'
        },
        og: {
            image: 'http://www.techshare.io/log_mail2.png',
            title: "TechShare",
            description: 'Techshare - A social network to share and discover information about software and programming'
        }
    });
});
