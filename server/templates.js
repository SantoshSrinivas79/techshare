/**
 * Created by vaibhav1 on 4/21/16.
 */
Templates = {};

Templates.welcome = {
    path: 'welcome.html',
    helpers: {
        username: function () {
            return this.username;
        }
    },
    route: {
        path: '/welcome/:username',
        data: function (params) {
            return {
                username: params.username
            };
        }
    }
};

TemplateHelpers = {};