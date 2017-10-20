function TRUE() {
    return true;
}

function FALSE() {
    return false;
}

function SELF(arg) {
    return function () {
        return arg;
    }
}

// key enhancement
function has(dict, key) {
    return dict.hasOwnProperty(key) && dict[key] !== null && dict[key] !== "";
}

function KeyError(key, dict_name) {
    return format('KeyError: {0} is not in {1}', key, JSON.stringify(dict_name));
}

function isDate(value) {
    return !isNaN(new Date(value).getFullYear());
}

function isFunction(e) {
    return "[object Function]" === Object.prototype.toString.call(e);
}

function isInteger(obj) {
    return Math.floor(obj) === obj
}

function isArray(e) {
    return "[object Array]" === Object.prototype.toString.call(e);
}

function format(pattern) {
    var reg;
    var remove_bracket = function (str) {
        return str.replace(/[{}]/g, "");
    };
    /* There are 2 possibilities in the second object param
        1. Object replace index patterns in the pattern string as a whole
        2. Object pattern : {key} in pattern string will be replaced as object[key]
    */
    if (arguments.length == 2 && typeof(arguments[1]) == "object") {
        var count = 0;
        reg = /\{(\w+)\}/gm;
        var args = arguments[1];
        var result = pattern.replace(reg, function (name) {
            count = count + 1;
            return args[remove_bracket(name)];
        });
        if (count > 0) {
            return result;
        }
    }
    var reg = /\{\d*\}/gm;
    var args = arguments;
    return pattern.replace(reg, function (name) {
        return args[parseInt(remove_bracket(name)) + 1];
    });

}

function get_or_default(dict, key, default_value, f) {
    if (dict.hasOwnProperty(key)) {
        return (f) ? f(dict[key]) : dict[key];
    } else {
        return default_value;
    }
}

function slice(array, start, end) {
    start = start || 0;
    end = end || array.length;
    var result = [];
    for (var i = start; i < end; i++) {
        result.push(array[i]);
    }
    return result;
}

//create a closure and ready-made configurations for pseudo class
var warm_up = function () {
    var memo = {};
    return function (pseudo_class, force_renew) {
        var __renew = force_renew || false;
        if (memo.hasOwnProperty(pseudo_class) && !__renew) {
            return memo[pseudo_class];
        } else {
            memo[pseudo_class] = new pseudo_class();
            return new pseudo_class();
        }
    }
}

function clone(obj) {
    var result;
    if (isArray(obj)) {
        result = new Array(obj.length);
        for (var i = 0; i < obj.length; i++) {
            result[i] = clone(obj[i]);
        }
        return result;
    } else if (obj instanceof Object) {
        result = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                result[i] = clone(obj[i]);
            }
        }
        return result;
    } else {
        return obj;
    }
}

// key enhancement
// exceptions
var named_object = function (/*arguments for attrs*/) {
    var args = slice(arguments, 0);
    return function (/*instance arguments*/) {
        var ret = {};
        var __args = Array.prototype.slice.call(arguments, 0);
        var limit = min(args.length, __args.length);
        for (var i = 0; i < limit; i++) {
            ret[args[i]] = __args[i];
        }
        return {};
    };
};
var Exception = {
    encode: function (/*infinite*/) {
        var msg = slice(arguments, 0);
        return JSON.stringify(msg);
    },
    decode: function (msg) {
        return JSON.parse(msg);
    }
};

//
// functional begin
function compose(/*infinite arguments*/) {
    var funcs = slice(arguments, 0);
    var last = funcs.pop();
    return function (/*arguments for the last function*/) {
        return funcs.reduceRight(function (r, f) {
            return f(r);
        }, last.apply(this, arguments));
    }
}

function curry(f/*infinite arguments*/) {
    if (f) {
        var __args = slice(arguments, 0) || [];
        var __curry = arguments.callee;
        return function () {
            var __inargs = __args.concat(slice(arguments));
            if (__inargs.length < f.length + 1) {
                return __curry.apply(this, __inargs);
            } else {
                return f.apply(this, __inargs.slice(1));
            }
        }
    } else {
        throw ("Function Error: no function supplied")
    }
    ;
}

function map(func, items) {
    switch (func.length) {
        case 1:
            var result = [];
            for (var i = 0; i < items.length; i++) {
                try {
                    result[i] = func(items[i]);
                }
                catch (e) {
                    console.log(e);
                }
            }
            return result;
        case 2:
            var result = [];
            for (var i in items) {
                if (items.hasOwnProperty(i)) {
                    try {
                        result[i] = func(i, items[i]);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
            return result;
    }
}

/*
* func: \x.y
        x: the iterating items
        y: result in each iteration
*/
function reduce(func, init, items) {
    var result = init;
    for (var i = 0; i < items.length; i++) {
        result = func(items[i], result);
    }
    return result;
}

function reduce_right(func, init, items) {
    var result = init;
    for (var i = items.length - 1; i >= 0; i--) {
        result = func(items[i], result);
    }
    return result;
}

function filter(func, items) {
    var result = [];
    switch (func.length) {
        case 1:
            for (var i = 0; i < items.length; i++) {
                try {
                    if (func(items[i])) {
                        result.push(items[i]);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
            break;
        case 2:
            for (var i in items) {
                if (items.hasOwnProperty(i)) {
                    try {
                        if (func(i, items[i])) {
                            result.push(items[i]);
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
    }
    return result;
}

function foreach(func, items) {
    switch (func.length) {
        case 1:
            for (var i = 0; i < items.length; i++) {
                try {
                    func(items[i]);
                }
                catch (e) {
                    console.log(e);
                }
            }
            break;
        case 2:
            for (var i in items) {
                if (items.hasOwnProperty(i)) {
                    try {
                        func(i, items[i]);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
    }
}

// functional end

//list begin

function cycle(list) {
    if (!Array.isArray(list)) {
        throw ("Not a list");
    }
    var index = 0;
    var next = function () {
        var res = list[index % list.length];
        index++;
        return res;
    }
    var current = function () {
        return index;
    };
    return {
        next: next,
        current: current
    }
}

function duplicate(pattern, times) {
    return new Array(times).fill(pattern)
}

function iterate(func, times) {
    var result = [];
    for (var i = 0; i < times; i++) {
        result.push(func());
    }
    return result;
}

function len(list) {
    return list.length
};

function call_self(x) {
    return typeof(x) == "function" ? x() : x
};

function max(/* infinite length*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    var __idx = 0;
    for (var i = 0; i < args.length; i++) {
        if (args[i] > args[__idx]) {
            __idx = i;
        }
    }
    return args[__idx];
}

function min(/* infinite length*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    var __idx = 0;
    for (var i = 0; i < args.length; i++) {
        if (args[i] < args[__idx]) {
            __idx = i;
        }
    }
    return args[__idx];
}

//function zip(/* infinite length*/){
//    var limit = max(map(len, arguments));
//    var cycles = map(cycle, arguments);
//    return iterate(map(call_self, cycles), limit);
//}
function zip(/*infinite arguments*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    var limit = max.apply(this, map(len, args));
    var cycles = map(cycle, args);
    var result = [];
    for (var i = 0; i < limit; i++) {
        result.push(map(function (c) {
            return c.next();
        }, cycles));
    }
    return result;
}

function to_dict(pk, list) {
    var result = {};
    for (var i in list) {

    }
}

function sum(list) {
    return reduce(function (x, y) {
        return x + y;
    }, 0, list);
}

function join(separator, items) {
    return items.join(separator);
}

function first(list) {
    if (list.length < 0) {
        throw("List Empty Error");
    }
    else {
        for (var i in list) {
            if (list.hasOwnProperty(i)) {
                return list[i];
            }
        }
    }
}

function split(arr, split_points) {
    var ret = [];
    if (!isArray(split_points)) {
        ret.push(splice(arr, 0, split_points));
        ret.push(splice(arr, split_points));
        return ret;
    } else {
        var current_start = 0;
        for (var i = 0; i < split_points.length; i++) {
            var split_point = split_points[i];
            ret.push(slice(arr, current_start, split_point));
            current_start = split_point;
        }
        return ret;
    }
}

//list end


//js enhancement

function to_list(dict) {
    if (typeof(dict.prototype) != "object") {
        throw (format("{0} is not an object.", dict));
    }
    var result = [];
    for (var i in dict) {
        if (dict.hasOwnProperty(i)) {
            result.push([i, dict[i]]);
        }
    }
    return result;
}

/*
    @description: extract list item from its parent list, and perform changes on it.
*/
function flat_map(list_of_list, func) {
    var result = [];
    for (var i in list_of_list) {
        if (list_of_list.hasOwnProperty(i)) {
            var list = map(func, list_of_list[i]);
            result = result.concat(list);
        }
    }
    return result;
}

function fmap_to_dict(key_row, list) {
    if (typeof(list) != "object") {
        throw (format("{0} is not an object.", dict));
    }
    var result = {};
    for (var i = 0; i < list.length; i++) {
        if (list[i].hasOwnProperty(key_row)) {
            result[list[i][key_row]] = list[i];
        }
    }
    return result;
}

//object/dict enhancement
function dict_union(o1, o2) {
    var ret = {};
    for (var i in o2) {
        if (o2.hasOwnProperty(i)) {
            ret[i] = o2[i];
        }
    }
    ;
    for (var i in o1) {
        if (o1.hasOwnProperty(i)) {
            ret[i] = o1[i];
        }
    }
    ;
    return ret;
}

function is_equal_dict(dict1, dict2) {
    var result = true;
    for (var i in dict1) {
        if (dict1.hasOwnProperty(i)) {
            if (dict2.hasOwnProperty(i)) {
                if (dict1[i] === dict2[i]) {/*default expect, the two dict is equal at the moment*/
                }
                else {
                    return false;
                    /*value sets are different*/
                }
            }
            return false;
            /* key sets are different */
        }
    }
    return true;
}

function create_dict_from_list(list, func) {
    var result = {};
    for (var i in list) {
        if (list.hasOwnProperty(i)) {
            result[list[i]] = func(list[i]);
        }
    }
    return result;
}

function keys(dict) {
    var result = [];
    for (var i in dict) {
        if (dict.hasOwnProperty(i)) {
            result.push(i);
        }
    }
    return result;
}

function values(dict) {
    var result = [];
    for (var i in dict) {
        if (dict.hasOwnProperty(i)) {
            result.push(dict[i]);
        }
    }
    return result;
}

function items(dict) {
    var result = [];
    for (var i in dict) {
        if (dict.hasOwnProperty(i)) {
            result.push([i, dict[i]]);
        }
    }
    return result;
}

function is_dict_empty(dict) {
    return keys(dict).length == 0;
}

//object/dict enhancement


/*
dict list enhancement: matrices in the form of [{key:value ...} ...],
organized in row-style but sometimes needs column base operation
*/
function value_of_col(dict_list, key) {
    if (dict_list.hasOwnProperty(key)) {
        throw(format("Key Error: key '{0}'doesn't exist", key));
    }
    return map(function (i) {
        return i[key]
    }, dict_list);
}

/*
    convert row and column.
*/
function transform(list_dict, cols) {
    var result = map(function (i) {
        return {};
    }, list_dict[0]);
    for (var i in list_dict) {
        if (list_dict.hasOwnProperty(i)) {
            var item = list_dict[i];
            for (var j in item) {
                if (item.hasOwnProperty(j)) {
                    var col_idx = cols ? cols[i] : i;
                    result[j][col_idx] = list_dict[i][j];
                }
            }
        }
    }
    return result;
}

//dict list enhancement end

//customize events
function event() {
    var __handlers = [];
    var __markers = {};
    var count = 0;
    var remove = function (arr, i) {
        arr.splice(i, i);
    }
    var reg = function (handler) {
        __handlers.push(handler);
        __markers[count] = __handlers.indexOf(handler);
        count = count + 1;
        return count;
    }
    var trigger = function (/*arguments to send in event handlers*/) {
        for (var i = 0; i < __handlers.length; i++) {
            __handlers[i].apply(this, arguments);
        }
    }
    var unreg = function (marker) {
        if (__markers.hasOwnProperty(marker)) {
            remove(__handlers, __markers[i]);
            delete marker[marker];
        } else {
            throw ("Key Error: no such callback, mark as " + marker);
        }
    }
    return {
        reg: reg,
        trigger: trigger,
        unreg: unreg
    }
}

function event_hub(/*initial events*/) {
    var init_events = Array.prototype.call(arguments, 0);
    var event_repo = {};
    var set = function (event_name) {
        if (!event_repo.hasOwnProperty(event_name)) {
            event_repo[event_name] = event();
        }
    };
    foreach(function (e) {
        set(e);
    }, init_events);
    var subscribe = function (event_name, callback) {
        set(event_name);
        var e = event_repo[event_name];
        return e.reg(callback)
    }
    var trigger = function (event_name /*arguments*/) {
        var e = get_with_throw(event_repo, event_name);
        var args = Array.prototype.slice.call(arguments, 1);
        return e.trigger.apply(this, args);
    }
    var unsubscribe = function (event_name, handler) {
        var e = get_with_throw(event_repo, event_name);
        return e.unreg(handler);
    }
    return {
        set: set,
        subscribe: subscribe,
        trigger: trigger,
        unsubscribe: unsubscribe
    }
}


function property_monitor(initial_value, is_equal, customize_update) {
    var __center = event();
    var __property = initial_value || null;
    var __equals = is_equal || function (o1, o2) {
        return o1 === o2
    };
    var __update = customize_update;
    var set = function (new_data) {
        //update in function;
        if (__equals(__property, new_data)) {/* no status change occurs.*/
        }
        else {
            if (__update) {
                __update(__property, new_data)
            } else {
                __property = new_data;
            }
            __center.trigger(__property);
        }
    }
    var get = function () {
        return __property;
    }
    return {
        get: get,
        set: set,
        subscribe: __center.reg,
        unsubscribe: __center.unreg
    };
}

//customize events

//set begin
/*
    @decription: hash set providing several set operations;
*/
function set(list/*empty, list, dict*/) {

    var inner_set = function (list) {
        var __structure = {};
        if (list) {
            if (typeof(list) == 'object') {
                if (Array.isArray(list)) {
                    for (var i = 0; i < list.length; i++) {
                        __structure[list[i]] = null;
                    }
                } else {
                    for (var i in list) {
                        if (list.hasOwnProperty(i)) {
                            __structure[i] = null;
                        }
                    }
                }
            } else {
                throw(format("Invalid param: valid type should be array and object, but {0} is {1}"), list, typeof(list));
            }
        }

        // set operations
        this.all = function () {
            return keys(__structure);
        };
        this.union = function (set2/**/) {
            return new inner_set((__structure).concat(set2.all()));
        }
        this.intersect = function (set2) {
            var set2_key = set2.all();
            var intersect_key = filter(function (i) {
                return __structure.hasOwnProperty(i)
            }, set2_key);
            return new inner_set(intersect_key);
        }
        this.diff = function (set2) {
            var set2_key = set2.all();
            var new_diff = clone(__structure);
            for (var i = 0; i < set2_key.length; i++) {
                if (new_diff.hasOwnProperty(i)) {
                    delete new_diff[i];
                }
            }
            return new inner_set(new_diff);
        }
        this.subset = function (condition) {
            if (condition instanceof Array) {
                // filter by element name
                check_param_with_throw(condition, [function (f) {
                    return __structure.hasOwnProperty(condition)
                }]);
                return new inner_set(condition);
            } else if (typeof(condition) == 'function') {
                // filter by predicates
                return filter(condition, keys(__structure));
            } else {
                // Invalid input
                throw ("Illegal Element: unsupported subset parameter");
            }
        }
        // statistics
        this.len = function () {
            return __structure.length;
        }
        this.empty = function () {
            return __structure.length === 0;
        }
        this.exists = function (element) {
            return __structure.hasOwnProperty(element);
        }
        // modification
        this.add = function (elements) {
            array_or_single(function (e) {
                __structure[e] = null;
            }, elements);
        }
        this.remove = function (element) {
            if (!__structure.hasOwnProperty(element)) {
                throw (format("Key Error: {0} doesn't exist"));
            }
            delete __structure[element];
        }
    }
    if (list instanceof inner_set) {
        return list;
    } else {
        return new inner_set(list);
    }

}

//set end
//matrix begin
function matrix(/*list , list of lists*/) {

}

//matrix end

//api style helper
/*
    function, {}
*/
var array_or_single = function (func, param) {
    if (Array.isArray(param)) {
        return map(func, param);
    } else {
        return func(param);
    }
}
var no_param_as_all = function (func, all) {
    return function (name) {
        return name ? func(name) : func(all)
    }
}

function get_with_throw(dict, name) {
    if (dict.hasOwnProperty(name)) {
        return dict[name];
    }
    else {
        throw (format("Key Error: {0} is not in {1}", name, dict));
    }
};

function check_param_with_throw(param, predicates) {
    var result = map(function (p) {
        return p(param)
    }, predicates);
    var all_pass = reduce(function (i, cumulant) {
        return cumulant && i['result']
    }, true, test_suite);
    if (!all_pass) {
        throw(format("Illegal params: the param {0} doesn't pass all tests", param));
    }
}

//api style helper

//gadgets
function indexed_array(key, /*key immutable*/object_array) {
    var __inverse_config;
    var __array = object_array;

    for (var i = 0; i < __array.length; i++) {
        __inverse_config[__array[i][key]] = i;
    }

    var get = function (natural_index) {
        return object_array[natural_index];
    };
    var inverse_get = function (key) {
        if (__inverse_config.hasOwnProperty(key)) {
            return __array[__inverse_config[key]];
        } else {
            throw ("KeyError: no such key " + key);
        }
    }
    var index_of = function (key) {
        if (__inverse_config.hasOwnProperty(key)) {
            return __inverse_config[key];
        } else {
            throw ("KeyError: no such key " + key);
        }
    }
    var update = function (new_data, update_callback) {
        update_callback = update_callback || []
        for (var i = 0; i < __array.length; i++) {
            var item = __array[i];
            if (new_data.hasOwnProperty(item.key)) {
                if (item.value != new_data[item.key]) {
                    __array[i]['value'] = new_data[item.key];
                    update_callback(item);
                } else {/* unmodified data, no need to call event */
                }
            } else {/*illegal keys exists only in new_data*/
            }
        }
    }
    var to_dict = function () {
        var result = {};
        for (var i = 0; i < __array.length; i++) {
            var _key = __array[i][key];
            var _value = __array[i];
            result[key] = value;
        }
        return result;
    }
    return {
        get: get,
        inverse_get: inverse_get,
        index_of: index_of,
        update: update,
        len: function () {
            return __array.length;
        },
        to_dict: to_dict
    }
}

function switch_hub(list, on_action, off_action) {
    var __switches = function () {
        if (Array.isArray(list)) {
            return create_dict_from_list(list, function () {
                return false;
            });
        } else if (!Array.isArray(list) && typeof(list) == 'object') {
            return create_dict_from_list(keys(list), function () {
                return false;
            });
        } else {
            throw(format("Argument illegal Error: '{0}' is not iterable.", list));
        }
    }(list);
    var __action = {
        true: on_action,
        false: off_action
    };
    var transit = function () {
        var one_line = function (status, name) {
            get_with_throw(__switches, name);
            __switches[name] = status;
            var action = __action[status];
            action(name);
        }

        var fix_status = function (status) {
            var fix_status_one_line = function (status) {
                return function (name) {
                    return one_line(status, name);
                }
            }(status);
            return function (names) {
                return array_or_single(fix_status_one_line, names);
            }
        };
        var toggle_status = function (names) {
            var toggle_type_one_line = function (name) {
                return one_line(!__switches[name], name);
            };
            return array_or_single(toggle_type_one_line, names);
        }
        return {
            on: fix_status(true),
            off: fix_status(false),
            toggle: toggle_status
        }
    }();

    var get = function (name) {
        if (name) {
            return get_with_throw(__switches, name);
        } else {
            return Array.copyWithin(__switches);
        }
    }
    var on_switches = function () {
        var result = [];
        for (var i in __switches) {
            if (__switches.hasOwnProperty(i)) {
                if (__switches[i]) {
                    result.push(i);
                }
            }
        }
        return result;
    }
    var off_switches = function () {
        var result = [];
        for (var i in __switches) {
            if (__switches.hasOwnProperty(i)) {
                if (!__switches[i]) {
                    result.push(i);
                }
            }
        }
        return result;
    }

    return {
        on: no_param_as_all(transit.on, keys(__switches)),
        off: no_param_as_all(transit.off, keys(__switches)),
        toggle: no_param_as_all(transit.toggle, keys(__switches)),
        get: get,
        on_switches: on_switches,
        off_switches: off_switches,
    }
}

/*
@description: simple state machine for
@params: states:
*/
function simple_state_machine(transitions, initial_state) {
    var t_without_from = filter(function (t) {
        return !t.hasOwnProperty('from')
    }, transitions);
    var t_without_to = filter(function (t) {
        return !t.hasOwnProperty('to')
    }, transitions);
    if (t_without_from > 0) {
        throw(format("Transition Error: The following transitions don't have start states: []", t_without_from.join(', ')));
    }
    if (t_without_to > 0) {
        throw(format("Transition Error: The following transitions don't have end states: []", t_without_to.join(', ')));
    }
    var __state = map(function (t) {
        return t['from'];
    }, transitions)
        .concat(map(function (t) {
            return t['to'];
        }, transitions));
    var current_state;
    if (__state.indexOf(initial_state) != -1) {
        current_state = initial_state;
    } else {
        throw("State Exception: no such state " + initial_state);
    }

    var __transitions = transitions;
    var __actions = actions;


    var is = function (state) {
        return current_state == state;
    }
    var state = function () {
        return current_state;
    }
    var trigger = function (name/*arguments*/) {
        if (__transitions.hasOwnProperty(name)) {
            var transition = __transitions[name];
            if (current_state == transition['from']) {
                transition['action'].apply(null, arguments);
                current_state = transition['to'];
                return this;
            } else {
                throw ("State Error: transition start error");
            }
        }
        else {
            throw("Key Error: no such transition" + name);
        }
    }
}

/*
    @description: a simple circular state machine that triggers each action in circular style.
    @param: states, list, states in the state machine
    @param: actions, list, function(from: (from state), to: (to state), args...)

    @return {trigger, get, reset}
*/
function circular_state(states, action, reset_state) {
    reset_state = reset_state || 0;
    var __states = state;
    var __actions = actions;
    var current_state = 0;
    var trigger = function () {
        var next_state = state[(current_state + 1) % current_state.length];
        action.apply(this, [state[current_state], next_state].concat(slice(arguments)));
    }
    var get = function () {
        return state[current_state];
    }
    var reset = function () {
        action.apply(this, [state[current_state], reset_state].concat(slice(arguments)));
    }
    return {
        trigger: trigger,
        get: get,
        reset: reset
    }
}

function repository() {
    var repo = {};
    var get = function (id) {
        return get_with_throw(repo, id);
    }
    var create = function (id, model) {
        if (repo.hasOwnProperty(id)) {
            throw(format("{0} already exists", id));
        } else {
            repo[id] = model;
        }
    }
    var update = function (id, model) {
        if (repo.hasOwnProperty(id)) {
            repo[id] = model;
        } else {
            throw KeyError(id, repo);
        }
    }
    var remove = function (id) {
        if (repo.hasOwnProperty(id)) {
            delete repo[id];
        } else {
            throw KeyError(id, repo);
        }
    }
    return {
        get: get,
        create: create,
        update: update,
        remove: remove,
    }
}

/*
    @description: a simple circular state machine that triggers each action in circular style.
    @param: list, list, states in the state machine
    @param: on_action, list, function(from: (from state), to: (to state), args...)
    @param: off_action, list, function(from: (from state), to: (to state), args...)
    @param: initial, list, function(from: (from state), to: (to state), args...)

    @return {trigger, get, reset}
*/
function exclusive_switch_hub(list, on_action, off_action, initial) {
    var __switches = function () {
        if (Array.isArray(list)) {
            return create_dict_from_list(list, function () {
                return false;
            });
        } else if (!Array.isArray(list) && typeof(list) == 'object') {
            return create_dict_from_list(keys(list), function () {
                return false;
            });
        } else {
            throw(format("Argument illegal Error: '{0}' is not iterable.", list));
        }
    }(list);


    var __action = {
        true: on_action,
        false: off_action
    };
    var select = function (name) {
        var one_line = function (status, name) {
            get_with_throw(__switches, name);
            if (__switches[name] != status) {
                __switches[name] = status;
                var action = __action[status];
                action(name);
            }
        }
        foreach(function (name) {
            one_line(false, name);
        }, filter(function (n) {
            return n !== name
        }, keys(__switches)));
        one_line(true, name);
    };

    var get = function (name) {
        if (name) {
            return get_with_throw(__switches, name);
        } else {
            return Array.copyWithin(__switches);
        }
    }
    var on_switch = function () {
        for (var i in __switches) {
            if (__switches.hasOwnProperty(i)) {
                if (__switches[i]) {
                    return i;
                }
            }
        }
    }
    var off_switches = function () {
        var result = [];
        for (var i in __switches) {
            if (__switches.hasOwnProperty(i)) {
                if (!__switches[i]) {
                    result.push(i);
                }
            }
        }
        return result;
    }

    select(initial);

    return {
        select: select,
        get: get,
        on_switch: on_switch,
        off_switches: off_switches,
    }
}

function NamedTree() {
    var nodes = [];
    var edges = [];
    var index = {};
    var __tree = this;
    //create nodes
    var create_edge = function (parent, child) {
        if (isArray(child)) {
            var __create_edge = arguments.callee;
            foreach(function (c) {
                __create_edge(parent, c);
            }, child);
        } else {
            if (child instanceof Node) {
                if (parent !== null && !index.hasOwnProperty(parent.name)) {
                    throw(format("parent {0} doesn't exist", parent.toString()));
                } else {
                    if (!index.hasOwnProperty(child.name)) {
                        reg_node(child);
                    }
                    if (parent !== null) {
                        edges[index[parent.name]].push(index[child.name]);
                    }
                }
            } else {
                throw (format('{0} is not a valid node', child));
            }
        }
    };
    var reg_node = function (node) {
        if (!index.hasOwnProperty(node.name)) {
            index[node.name] = nodes.push(node) - 1;
            edges.push([]);
        } else {
            throw format('{0} is used in this tree', node.name);
        }
    };
    var Node = function (name, value, parent) {
        this.name = name;
        this.value = value;
        this.parent = parent || null;
        var that = this;
        this.toString = function () {
            return format('Node<name:{0}, value:{1}>', that.name, that.value);
        }
    };

    var create_node = function (name, value, parent) {
        var node = parent ? new Node(name, value, parent) : new Node(name, value);
        reg_node(node);
        create_edge(node.parent, node);
        return node;
    };
    var get_node = function (name) {
        return nodes[index[name]];
    };
    //inner members

    var check_name = function (name) {
        if (!index.hasOwnProperty(name)) {
            throw (format('{0} is not in this tree', name));
        }
    };
    //tree operation

    this.get = function (name) {
        check_name(name);
        return get_node(name).value;
    }
    this.create = function (name, value, parent_name) {
        var parent;
        if (parent_name !== null) {
            if (index.hasOwnProperty(parent_name)) {
                parent = get_node(parent_name);
            } else {
                throw format("{0} doesn't exist", parent_name);
            }
        } else {
            parent = null;
        }
        if (!index.hasOwnProperty(name)) {
            create_node(name, value, parent);
        } else {
            throw format("{0} is already exists", name);
        }
    };
    this.get_layer = function (name) {
        check_name(name);
        var node = get_node(name);
        var counter = 0;
        while (node !== null) {
            counter++;
            node = node.parent;
        }
        return counter;
    };
    this.traverse = function (func, order, start_name) {
        var __travel = function (node_idx, layer) {
            if (is_pre) {
                var node = nodes[node_idx];
                func(node.name, node.value, node_idx, layer);
            }
            var next = edges[node_idx]
            var _inner_travel = arguments.callee;
            if (next.length > 0) {
                foreach(function (e) {
                    _inner_travel(e, layer + 1);
                }, next);
            }
            if (is_post) {
                var node = nodes[node_idx];
                func(node.name, node.value, node_idx, layer);
            }
        };
        order = order || "pre";
        var is_pre = order === "pre" || order === "both";
        var is_post = order === "post" || order === "both";
        if (start_name) {
            check_name(start_name);
            __travel(index[start_name], __tree.get_layer(start_name));
        } else {
            __travel(0, 0);
        }
    };
}

//gadgets
//random
var random = function (start, end) {
    start = start || 0;
    end = end || 1;
    var range = end - start;
    return Math.random() * range + start;
};
var randomInt = function (start, end) {
    return parseInt(random(start, end));
};
var choice = function (arr) {
    return arr[randomInt(0, arr.length)];
};
var shuffle = function (arr, times) {
    var len = arr.length;
    var exchange = function (i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    };
    for (var i = 0; i < times; i++) {
        var choice1 = randomInt(0, len);
        var choice2 = randomInt(0, len);
        exchange(choice1, choice2);
    }
    return arr;
};
//random

//support functions
function date_format(date) {
    if (isDate(date)) {
        return format('{0}/{1}/{2}', date.getFullYear(), date.getMonth(), date.getDate());
    } else {
        throw (format('{0} is not a date', date));
    }
}

function live(parent, target, event_name, handler) {
    var single_handling = function (t, e, real_target) {
        var compute_target = isFunction(t) ? t(e) : t;
        if (real_target.is(compute_target)) {
            handler.apply(real_target, e);
        }
    };
    parent.on(event_name, function (e) {
        var __target = $(e.target);
        if (isArray(target)) {
            foreach(function (t) {
                single_handling(t, e, __target);
            }, target);
        } else {
            single_handling(target, e, __target);
        }
    })
}

//support functions
