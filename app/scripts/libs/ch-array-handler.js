angular
    .module('chArrayHandler', [])

    .service('chArrayHandler', [function() {

        var defaults = {
            merge: 'add', // 'add', 'replace', 'remove', 'update', 'intersection'
            lookAt: ['id'],
            update: true, // true/false
            deep: false, // true/false
            clone: false, // true/false
            order: false // true/false
        }

        var NotUniqueException = function() {
           this.message = '`lookAt` values should point to unique values';
           this.name = 'NotUniqueException';
        }

        var deepMerge = function(obj1, obj2) {
            var result = {};
            for (var i in obj1) {
                if (i !== '$$hashKey') {
                    if ((i in obj2) && (typeof obj1[i] === 'object') && (i !== null)) {
                        result[i] = deepMerge(obj1[i], obj2[i]);
                    } else {
                        result[i] = obj1[i];
                    }
                }
            }
            for (var i in obj2) {
                if (i !== '$$hashKey') {
                    if (i in result) {
                        continue;
                    }
                    result[i] = obj2[i];
                }
            }
            return result;
        }

        return {

            mergeObjectsArray: function(ar1, ar2, options) {
                var res = options.clone ? angular.copy(ar1) : ar1;
                var service = this;
                var opt = angular.extend(angular.copy(defaults), options || {});
                var lookAt = opt.lookAt;
                var toNotRemove = ((opt.merge == 'replace' && !opt.order) || opt.merge == 'intersection') ? [] : null;
                var toRemove = (opt.merge == 'remove') ? [] : null;
                var shift = 0;
                var added = 0;
                for (var i = 0; i < ar2.length; i++) {
                    var model = ar2[i];
                    var index = service.getObjectIndexInArray(res, model, lookAt);
                    if (!opt.order || index == (i+shift) || index === false) {
                        res = service.updateObjectInArray(res, model, opt, index);
                    } else {
                        res.splice(i+shift, 0, model);
                        shift += 1;
                    }
                    switch (opt.merge) {
                        case 'replace':
                            if (index === false && !opt.order) {
                                toNotRemove.push(res.length - 1);
                            } else {
                                toNotRemove.push(index);
                            }
                            break;
                        case 'remove':
                            if (index !== false) {
                                toRemove.push(index);
                            }
                            break;
                        case 'intersection':
                            if (index !== false) {
                                toNotRemove.push(index);
                            }
                            break;
                        default:
                            break;
                    }
                }

                if (toNotRemove !== null) {
                    var shift = 0;
                    var l = res.length;
                    var z = 0;
                    var shift = 0;
                    while(res[z]) {
                        if (toNotRemove.indexOf(z + shift) === -1) {
                            res.splice(z, 1);
                            shift += 1;
                        } else {
                            z++;
                        }
                    }
                }

                if (opt.merge == 'replace' && opt.order) {
                    res.splice(ar2.length, res.length);
                }

                if (toRemove !== null) {
                    var shift = 0;
                    var l = res.length;
                    var z = 0;
                    while(z < l && res[z]) {
                        if (toRemove.indexOf(z) !== -1) {
                            res.splice(z - shift, 1);
                            shift += 1;
                        }
                        z++;
                    }
                }
                return res;
            },

            getOrderedByProps: function(ar, props) {
                var filterOrders = {};
                for (var i = 0; i < ar.length; i++) {
                    var model = ar[i];
                    for (var k = 0; k < props.length; k++) {
                        var key = props[k];
                        var val = model[key];
                        if (val !== undefined && val !== null) {
                            if (filterOrders[key] === undefined) {
                                filterOrders[key] = {};
                            }
                            if (filterOrders[key][val] !== undefined) {
                                throw new NotUniqueException();
                            }
                            filterOrders[key][val] = i;
                        }
                    }
                }
                return filterOrders;
            },

            getObjectIndexInArray: function(ar, obj, props) {
                if (ar.length > 0) {
                    var type = ar[0];
                    if (angular.isObject(type)) {
                        var filterOrders = this.getOrderedByProps(ar, props || defaults.lookAt);
                        for (var k = 0; k < props.length; k++) {
                            var key = props[k];
                            if (filterOrders[key] && filterOrders[key][obj[key]] !== undefined) {
                                return filterOrders[key][obj[key]];
                            }
                        }
                    } else {
                        var index = ar.indexOf(obj);
                        if (index >= 0) {
                            return index;
                        }
                    }
                }
                return false;
            },

            updateObject: function(obj1, obj2) {
                return deepMerge(obj1, obj2);
            },

            updateObjectInArray: function(res, model, options, index) {
                var service = this;
                var opt = angular.extend(angular.copy(defaults), options || {});
                index = index || this.getObjectIndexInArray(res, model, opt.lookAt);
                switch (opt.merge) {
                    case 'add':
                        if (index === false) {
                            res.push(model);
                        } else if (opt.update) {
                            if (angular.isObject(model)) {
                                if (opt.deep) {
                                    res[index] = service.updateObject(res[index], model);
                                } else {
                                    res[index] = angular.extend(res[index], model);
                                }
                            } else {
                                res[index] = model;
                            }
                        }
                        break;
                    case 'replace':
                        if (index === false) {
                            res.push(model);
                        } else {
                            if (opt.update) {
                                if (angular.isObject(model)) {
                                    if (opt.deep) {
                                        res[index] = service.updateObject(res[index], model);
                                    } else {
                                        res[index] = angular.extend(res[index], model);
                                    }
                                } else {
                                    //res[index] = model;
                                }
                            }
                        }
                        break;
                    case 'remove':
                        if (index !== false) {
                            res.splice(index, 1);
                        }
                        break;
                    case 'update':
                        if (index !== false) {
                            if (opt.update) {
                                if (angular.isObject(model)) {
                                    if (opt.deep) {
                                        res[index] = service.updateObject(res[index], model);
                                    } else {
                                        res[index] = angular.extend(res[index], model);
                                    }
                                } else {
                                    res[index] = model;
                                }
                            }
                        }
                        break;
                    case 'intersection':
                        if (index !== false) {
                            if (opt.update) {
                                if (angular.isObject(model)) {
                                    if (opt.deep) {
                                        res[index] = service.updateObject(res[index], model);
                                    } else {
                                        res[index] = angular.extend(res[index], model);
                                    }
                                } else {
                                    res[index] = model;
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
                return res;
            }
        }

    }]);