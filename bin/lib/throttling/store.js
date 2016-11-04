'use strict';
var defaults = require('defaults');
var RedisStore = (function () {
    function RedisStore(options) {
        this.options = defaults(options, {
            expiry: 60,
            prefix: "rl:"
        });
    }
    RedisStore.prototype.incr = function (key, cb) {
        var rdskey = this.options.prefix + key;
        var opt = this.options;
        opt.client.multi()
            .incr(rdskey)
            .ttl(rdskey)
            .exec(function (err, replies) {
            if (err) {
                return cb(err);
            }
            if (replies[0][1] === 1 || replies[1][1] === -1) {
                opt.client.expire(rdskey, opt.expiry);
            }
            cb(null, replies[0][1]);
        });
    };
    RedisStore.prototype.resetKey = function (key) {
        var rdskey = this.options.prefix + key;
        this.options.client.del(rdskey);
    };
    return RedisStore;
}());
exports.RedisStore = RedisStore;

//# sourceMappingURL=store.js.map
