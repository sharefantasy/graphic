define("paint_element", ["utils"], function () {
    var dist = function (start, end) {
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    }
    var add = function (v1, v2) {
        return point(v1.x + v2.x, v1.y + v2.y);
    }
    var length = function (p) {
        return Math.sqrt(p.x * p.x + p.y * p.y);
    }
    var point = function (x, y) {
        return {x: x, y: y};
    }
    var ScaleParam = function () {

    };

    var box = function (left, top, width, height, scale_param) {
        var __this_box = arguments.callee;
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.scaleParam = (scale_param && scale_param instanceof ScaleParam)? scale_param : new ScaleParam();
        this.__right = function () {
            return _left_ + _width_;
        };
        this.__bottom = function () {
            return _top_ + _height_;
        };
        this.isInside = function (point) {
            return (_left_ < point.x && point.x < __right())
                && (_top_ < point.y && point.y < __bottom());
        };
        this.scale = function (x_ratio, y_ratio) {
            if (x_ratio > 0 && y_ratio > 0) {
                _width_ *= x_ratio;
                _height_ *= y_ratio;
                return this;
            } else {
                throw "negative ratio";
            }
        };
        this.move = function (pos) {
            _top_ += pos.y;
            _bottom_ += pos.y;
            return this;
        };
        this.stroke = function (ctx) {
            ctx.strokeRect(_left_, _top_, _width_, _height_);
            return this;
        };
        this.fill = function (ctx) {
            ctx.fillRect(_left_, _top_, _width_, _height_);
            return this;
        };
        this.inside = function (ctx, action, env) {
            if (env) {
                ctx.translate(-env.left(), -env.top());
            }
            ctx.translate(_left_, _top_);
            action(ctx, this);
            ctx.translate(-_left_, -_top_);
            if (env) {
                ctx.translate(env.left(), env.top());
            }
        };

        this.originate = function () {
            return point(_left_, _top_);
        };
        this.translate_in = function (pos) {
            return point(pos.x - _left_, pos.y - _top_);
        };
        this.translate_out = function (pos) {
            return point(_left_ + pos.x, _top_ + pos.y);
        };
        this.to_box = function (base_box, pos) {
            return __this_box.translate_in(base_box.translate_out(pos));
        };
    };
    var angleOf = function (v) {
        if (v.y != 0) {
            return Math.asin(v.y / length(v));
        } else if (v.x != 0) {
            return Math.acos(v.x / length(v));
        } else {
            return 0;
        }
    }
    var vector = function (start, end) {
        this.x = end.x - start.x;
        this.y = end.y - start.y;
        var that = this;
        var __construct = function (x, y, a) {
            that.x = x;
            that.y = y;
            if (a) {
                that.a = a;
            } else {
                this.a = angleOf(point(x, y));
            }
            return that;
        };
        this.rotate = function (increment_angle) {
            var total_move = increment_angle + a;
            a = total_move;
            var almost_equal = function (n1, n2) {
                return Math.abs(n1 - n2) < 1e-6;
            }
            if (almost_equal(Math.cos(total_move), 0)) {
                return __construct(p.y, p.x * Math.sin(angle));
            } else if (almost_equal(Math.sin(total_move), 0)) {
                return __construct(p.x * Math.cos(total_move), p.y);
            } else {
                var d = length(p);
                return __construct(d * Math.cos(total_move), d * Math.sin(total_move));
            }
        };
        this.dot_product = function (other_vector) {
            return x * other_vector.x + y * other_vector.y;
        };
        this.length = function () {
            return Math.sqrt(that.x * that.x + that.y * that.y);
        }
    };
    var getVector = function (start, end) {
        return {
            x: end.x - start.x,
            y: end.y - start.y,
        }
    }
    var rotateVector = function (p, angle) {

    }

    var line = function (ctx, start, end) {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    };
    var lines = function (ctx, points) {
        var ret = [];
        for (var i = 0; i < points.length - 1; i++) {
            var start = points[i];
            var end = points[i + 1]
            ret.push([start, end]);
        }
        drawLines(ctx, ret);
    };
    var drawLines = function (ctx, lines) {
        foreach(function (l) {
            var start = l[0];
            var end = l[1];
            if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y)) {
                throw( "not a number");
            }
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }, lines);
    }
    var arrow = function () {
        var vector = point;
        var ORIGIN = point(0, 0);
        var dist = function (start, end) {
            return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        }
        var shift = function (start, vector) {
            return point(start.x + vector.x, start.y + vector.y);
        }
        var minus = function (p) {
            return point(-p.x, -p.y);
        }
        var length = function (p) {
            return Math.sqrt(p.x * p.x + p.y * p.y);
        }
        var angleOf = function (vector) {
            if (vector.y != 0) {
                return Math.asin(vector.y / length(vector));
            } else if (vector.x != 0) {
                return Math.acos(vector.x / length(vector));
            } else {
                return 0;
            }
        }
        var getVector = function (start) {
            return function (end) {
                return {
                    x: end.x - start.x,
                    y: end.y - start.y,
                }
            }
        }
        var rotateVector = function (p, angle) {
            var total_move = angle + angleOf(p);

            var almost_equal = function (n1, n2) {
                return Math.abs(n1 - n2) < 1e-6;
            }
            if (almost_equal(Math.cos(total_move), 0)) {
                return point(p.y, p.x * Math.sin(angle));
            } else if (almost_equal(Math.sin(total_move), 0)) {
                return point(p.x * Math.cos(total_move), p.y);
            } else {
                var d = length(p);
                return point(d * Math.cos(total_move), d * Math.sin(total_move));
            }
        }
        var tf = function (v) {
            var angle = angleOf(v);
            return {
                // transform from given to original space
                t: function (p) {
                    return add(rotateVector(p, angle), v);
                },
                // transform from original to given space
                r: function (p) {
                    return add(p, v);
                }
            }
        }

        return function (ctx, start, end, wing) {
            var v = getVector(start, end);
            var this_tf = tf(v);
            // 1st add, rotated to horizontal
            var new_start = ORIGIN;
            var new_end = v;

            // 2nd shift, end pointer oriented frame
            var wing_end = point(-wing.l, 0);
            var angle = angleOf(v);
            var left_wing_end = rotateVector(wing_end, wing.a + angle);
            //left_wing_end = rotateVector(left_wing_end, angle);
            var right_wing_end = rotateVector(wing_end, 2 * Math.PI - wing.a + angle);

            // 2nd shift finish
            left_wing_end = add(v, left_wing_end);
            right_wing_end = add(v, right_wing_end);

            var lines = [];
            lines.push([new_start, new_end]);
            lines.push([new_end, left_wing_end]);
            lines.push([new_end, right_wing_end]);
            drawLines(ctx, map(function (l) {
                return [add(start, l[0]), add(start, l[1])]
            }, lines));
        }
    }();

    var Graph = function (ctx, height, width) {
        var ctx_wrapper = function (ctx) {
            var new_ctx = clone(ctx);
            var origin_method = [
                'lineTo',
                'rect',
                'fillRect',
                'strokeRect',
            ]
            return {
                transform: transform,
                reset: reset,
            }
        };
        var __ctx = ctx;
        var __params = {
            height: height,
            width: width
        };
        var ec = event_hub('graph.params.update');
        var frame_dom = new NamedTree();
        var frames = {};
        var that = this;
        this.update = function (param) {
            foreach(function (k, v) {
                if (__params.hasOwnProperty(k)) {
                    __params[k] = v;
                }
            }, param);
            ec.trigger('graph.params.update', __params);
        }
        this.create_frame = function (left, top, width, height, angle, env) {

        }

    };
    var Frame = function (graph, left, top, width, height, angle) {

        this.points = {
            left_top: get_vect(point(left, top)),
            left_bottom: get_vect(point(left, top + height)),
            right_top: get_vect(point(left + width, top)),
            right_bottom: get_vect(point(left + width, top + height))
        }
        this.rotate = function (increment_angle) {
            foreach(function (p) {
                p.rotate(angle);
            }, points);
        }
        if (angle) {
            this.rotate(angle);
        }
    };
    return {
        point: point,
        box: box,
        arrow: arrow,
        line: line,
        drawLines: drawLines,
        lines: lines,
    };
});