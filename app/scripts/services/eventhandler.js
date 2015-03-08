'use strict';

/**
 * @ngdoc service
 * @name himatesApp.EventHandler
 * @description
 * # EventHandler
 * Service in the himatesApp.
 */
angular.module('himatesApp')
  .service('EventHandler', function EventHandler(AppServices, $firebase, chArrayHandler) {
    
    var cacheEvent = {};

    return {

        getEventById: function(id) {
            if (cacheEvent[id]) {
                return cacheEvent[id];
            }
            var ref = new Firebase(AppServices.fbUrl('events/' + id));
            return cacheEvent[id] = $firebase(ref).$asObject();
        },

        getAvailableDates: function(ev) {
            var dates = ev.availableDates || [];
            var res = [];
            var now = Date.now();
            for (var i = 0; i < dates.length; i++) {
                if (dates[i] >= now) {
                    res.push(dates[i]);
                }
            }
            return res;
        },

        getEventSubscriptions: function(ev) {
            return ev.subscriptions = ev.subscriptions || {};
        },

        getSubscriptionsByDate: function(ev, old) {
            var subscriptions = this.getEventSubscriptions(ev);
            var byDate = {};
            for (var k in subscriptions) {
                var subs = subscriptions[k];
                for (var i = 0; i < subs.length; i++) {
                    var m = subs[i];
                    var index = new Date(m.date).valueOf();
                    byDate[index] = byDate[index] || {
                        time: index,
                        date: new Date(m.date),
                        users: []
                    };
                    byDate[index].users.push(k);
                }
            }
            var res = [];
            for (var k in byDate) {
                res.push(byDate[k]);
            }
            return res;
        },

        getEventRejections: function(ev) {
            return ev.rejected || {};
        },

        getUserSubscriptions: function(ev, user) {
            var subscriptions = this.getEventSubscriptions(ev);
            return subscriptions[user.$id] || [];
        },

        getUserSubscriptionDates: function(ev, user) {
            var subscriptions = this.getUserSubscriptions(ev, user);
            var res = [];
            if (subscriptions && subscriptions.length > 0) {
                for (var i = 0; i < subscriptions.length; i++) {
                    res.push(new Date(subscriptions[i].date));
                }
            }
            return res;
        },

        setUserSubscriptions: function(ev, user, subs) {
            var subscriptions = this.getEventSubscriptions(ev);
            subscriptions[user.$id] = chArrayHandler.mergeObjectsArray(subscriptions[user.$id] || [], subs, {
                merge: 'replace',
                lookAt: ['date']
            });
        },

        getEventSubscriptionsLength: function(ev) {
            var n = 0;
            var subscriptions = this.getEventSubscriptions(ev);
            for (var k in subscriptions) n++;
            return n;
        },

        getEventRejectionsLength: function(ev) {
            var n = 0;
            var rejected = this.getEventRejections(ev);
            for (var k in rejected) n++;
            return n;
        },

        hasUserRejected: function(ev, user) {
            return ev.rejected && ev.rejected.indexOf(user.$id) != -1;
        }

    }

  });
