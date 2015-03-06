'use strict';

/**
 * @ngdoc service
 * @name himatesApp.AppServices
 * @description
 * # AppServices
 * Service in the himatesApp.
 */
angular.module('himatesApp')
  .service('AppServices', function AppServices(fbURL, $firebase) {

    var usersProfiles = {};

    return {

    	fbUrl: function(path) {
    		path = path || '';
    		var startsWithSlash = (path && path.length > 0) ? path[0] == '/' : false;
    		if (!startsWithSlash) {
    			path = '/' + path;
    		}
    		return fbURL + path;
    	},

        getProfile: function(id) {
          if (!usersProfiles[id]) {
            var usersRef = new Firebase(this.fbUrl('users'));
            var requested = usersRef.child(id);
            var sync = $firebase(requested).$asObject();
            usersProfiles[id] = {};
            sync.$loaded(function() {
              usersProfiles[id] = sync;
            });
          }
          return usersProfiles[id];
        },

        getRealName: function(user) {
            if (typeof user == 'string') {
                return this.getRealName(this.getProfile(user));
            }
            if (!user) {
                return '';
            }
            if (user.facebook) {
                return user.facebook.displayName;
            }
            if (user.google) {
                return user.google.displayName;
            }
            if (user.twitter) {
                return user.twitter.displayName;
            }
            if (user.github) {
                return user.github.displayName;
            }
        },

        getFirstName: function(user) {
            if (typeof user == 'string') {
                return this.getFirstName(this.getProfile(user));
            }
            if (!user) {
                return '';
            }

            if (user.facebook && user.facebook.cachedUserProfile) {
                return user.facebook.cachedUserProfile.first_name;
            }
            // if (user.google) {
            //     return user.google.displayName;
            // }
            // if (user.twitter) {
            //     return user.twitter.displayName;
            // }
            // if (user.github) {
            //     return user.github.displayName;
            // }
        },

        getUserId: function(user) {
            if (typeof user == 'string') {
                return user;
            } else {
                return user.$id;
            }
        },

        getAvatar: function(user) {
            if (typeof user == 'string') {
                return this.getAvatar(this.getProfile(user));
            }
            if (!user) {
                return '';
            }
            if (user.facebook) {
                return user.facebook.cachedUserProfile.picture.data.url;
            }
            if (user.twitter) {
                return user.twitter.cachedUserProfile.profile_image_url;
            }
            if (user.google) {
                return user.google.cachedUserProfile.picture;
            }
            if (user.github) {
                return user.github.cachedUserProfile.avatar_url;
            }
        }
    }
  });
