define('chart', ['utils', 'methods', 'paint_element'], function (u, m, paint) {
    var box = paint.box;
    var point = paint.point;
    var arrow = paint.arrow;

    var default_text_box = {
        width: 60,
        height: 20,
        padding: 2
    };
    var default_text_style = {
        font: "8px Georgia",
        color: 'black',
    };

    var config = function (obj) {
        return function (update) {
            foreach(function (k, v) {
                if (obj.hasOwnProperty(k)) {
                    obj[k] = v;
                }
            }, update);
        };
    };
    var gen_colors = function (len) {
        var ret = [];
        var unit = 360 / len;
        for (var i = 0; i < len; i++) {
            ret.push(format('hsl({0}, 100%, 64%)', i * unit));
        }
        var exchange = function (i, j) {
            var tmp = ret[i];
            ret[i] = ret[j];
            ret[j] = tmp;
        };
        for (var i = 0; i < len / 2; i = i + 2) {
            exchange(i, (i + len / 2) % len);
        }
        return ret;
    };
    var getMaxSize = function (text_frame, text_box) {
        var max_item_in_col = Math.floor((text_frame.bottom - text_frame.top) / (text_box.height - text_box.padding));
        var max_cols = Math.floor((text_frame.right - text_frame.left) / (text_box.width + text_box.padding));
        return {
            cols: max_cols,
            item_in_col: max_item_in_col
        };
    };

    var vertical = function (pos, box) {
        return {
            x: pos.x,
            y: pos.y - box.height
        };
    };
    var horizontal = function (pos, box) {
        return {
            x: pos.x - box.width,
            y: pos.y
        }
    };
    var draw_legend = function (ctx, text_frame, text_box, text_style, items, colors, col_stack_method, row_stack_method) {
        var rect = {
            padding: 2,
            width: 10,
            height: 10,
        };
        var text_max_width = text_box.width - text_box.padding;
        text_frame = (isFunction(text_frame)) ? text_frame() : text_frame;
        var box_start_pos = {
            x: text_frame.right - text_box.width,
            y: text_frame.bottom - text_box.height
        };
        var max_status = getMaxSize(text_frame, text_box);
        var max_item_in_col = max_status['item_in_col'];
        var max_cols = max_status['cols'];
        var text_clip = function (text) {
            if (text == "") {
                throw "no text";
            }
            var text_width = ctx.measureText(text).width;
            if (text_width > text_max_width) {
                var unit_len = text_width / text.length;
                return format('{0}{1}', text.slice(0, (text_max_width / unit_len) - 3), "...")
            } else {
                return text;
            }
        };
        var create_text_box = function (text, rect_color, left_corner) {
            ctx.fillStyle = rect_color;
            var rect_pos = {
                x: left_corner.x + rect.padding,
                y: left_corner.y + rect.padding,
            }
            ctx.fillRect(rect_pos.x, rect_pos.y, rect.width, rect.height);
            ctx.font = text_style.font;
            ctx.fillStyle = text_style.color;
            var text_pos = {
                x: rect_pos.x + rect.width + rect.padding,
                y: rect_pos.y + rect.height,
            }
            ctx.fillText(text_clip(text), text_pos.x, text_pos.y)
        };

        var create_col = function (start_pos, stack_method, col_items, colors) {
            if (col_items.length > max_item_in_col) {
                throw "too much in one row";
            }
            var current_pos = {
                x: start_pos.x,
                y: start_pos.y,
            }
            for (var i = 0; i < col_items.length; i++) {
                var item = col_items[i];
                var color = colors[i];
                create_text_box(item.description, color, current_pos);
                current_pos = stack_method(current_pos, text_box);
            }
        };
        var create_row = function (start_pos, stack_method, all_items, colors) {
            var item_len = items.length;
            var pos = box_start_pos;
            if (item_len <= max_item_in_col * max_cols) {
                for (var i = 0; i < Math.ceil(item_len / max_item_in_col); i++) {
                    var col_items = items.slice(i * max_item_in_col, (i + 1) * max_item_in_col);
                    var col_colors = colors.slice(i * max_item_in_col, (i + 1) * max_item_in_col);
                    col_stack_method = col_stack_method ? col_stack_method : vertical;
                    create_col(pos, col_stack_method, col_items, col_colors);
                    pos = stack_method(pos, text_box);
                }
            } else {
                throw "too much items";
            }
        };
        row_stack_method = row_stack_method ? row_stack_method : horizontal;
        create_row(box_start_pos, horizontal, items, colors);
    };
    var piechart = function (canvas) {
        var ctx = canvas.getContext("2d");
        var canvas_width = canvas.width;
        var canvas_height = canvas.height;
        ctx.clearRect(0, 0, canvas_width, canvas_height);
        //graph config
        var graph_text_padding = 10;
        var cx = canvas_width / 4; //Centre of the circle, x co-ord
        var cy = canvas_height / 2; //Centre of the circle, y co-ord
        var radius = canvas_width / 6; //Radius of the circle
        var graph_width = cx + radius / 2;
        var text_border_padding = 5;


        //configurable params
        var text_box = {
            width: 60,
            height: 20,
            padding: 2
        };
        var text_style = {
            font: "8px Georgia",
            color: 'black',
        };
        //configurable params

        var get_text_frame = function () {
            return {
                top: text_border_padding,
                bottom: canvas_height - text_border_padding,
                left: graph_width + graph_text_padding,
                right: canvas_width - text_border_padding,
            };
        };
        var draw_graph = function (items, colors) {
            var toRadians = function (deg) {
                return deg * Math.PI / 180 //Converts degrees into radians
            };
            var startTop = function (deg) {
                return toRadians(deg - 90); //Positions 0deg at the top of the circle instead of the left or east of the circle
            };

            var unit_angle = 360 / reduce(function (x, y) {
                return y + x.value;
            }, 0, items);
            var degree_map = map(function (i) {
                return unit_angle * i.value;
            }, items);
            var len = items.length;
            var path_point = [];
            var cumulate = 0;
            for (var i = 0; i < len; i++) {
                var angle = cumulate + degree_map[i];
                path_point.push([cumulate, angle]);
                cumulate = angle;
            }
            for (i = 0; i < len; i++) {
                var p = path_point[i];
                var item = items[i];
                ctx.beginPath(); //Begins drawing the path. See link in "Edit" section
                ctx.moveTo(cx, cy); //Moves the beginning position to cx, cy (100, 75)
                ctx.arc(cx, cy, radius, startTop(p[0]), startTop(p[1])); //	ctx.arc(cx, cy, radius, startAngle, endAngle, counterclockwise (optional));
                ctx.lineTo(cx, cy); //Draws lines from the ends of the arc to cx and cy
                ctx.closePath(); //Finishes drawing the path
                ctx.fillStyle = colors[i]; //Changes the color
                ctx.fill(); //Actually draws the shape (and fills)
                ctx.stroke();
            }
        };


        var draw = function (items) {
            var colors = gen_colors(items.length);
            draw_graph(items, colors);
            draw_legend(ctx, get_text_frame(), text_box, text_style, items, colors);
        };
        return {
            config_text_box: config(text_box),
            config_text_style: config(text_style),
            getMaxSize: getMaxSize,
            draw: draw
        }
    };
    var barchart = function (barchart, items) {
    };
    var linechart = function (canvas) {
        //standard config
        var ctx = canvas.getContext('2d');
        var canvas_width = canvas.width;
        var canvas_height = canvas.height;
        //legend config
        var text_box = clone(default_text_box);
        var text_style = clone(default_text_style);
        var text_border_padding = 5;
        var graph_text_padding = 10;

        //line chart config
        var point_padding = 10;
        var point_radius = 1;
        var xaxis_style = {
            font: "8px",
        };
        var graph_ratio = 1;
        var get_text_frame = function () {
            return box(text_border_padding, canvas_height * graph_ratio, canvas_width - 2 * text_border_padding, (1 - graph_ratio) * canvas_height - text_border_padding);
        };
        var draw_graph = function (items, x_label, colors) {
            var canvas_box = box(0, 0, canvas_width, canvas_height);
            var border_padding = 5;
            var x_axis_height = 20;
            var y_axis_width = 40;

            // graph box contains graph, y, x axis;
            var graph_box = box(border_padding, border_padding, canvas_width - 2 * border_padding, canvas_height - 2 * border_padding)
            var text_frame = get_text_frame();
            var yaxis_box = box(border_padding, border_padding, y_axis_width, graph_box.height() - text_frame.height());
            var xaxis_box = box(yaxis_box.right(), text_frame.top() - x_axis_height, graph_box.width() - yaxis_box.width(), x_axis_height);
            var inner_graph_box = box(yaxis_box.right(), graph_box.top(), graph_box.width() - yaxis_box.width(), graph_box.height() - xaxis_box.height() - text_frame.height());
            foreach(function (box) {
                box.stroke(ctx);
            }, [canvas_box]);


            var x_index = [];
            for (var i = 0; i < x_label.length; i++) {
                x_index.push(i);
            }
            var label_font_size = 12;
            var label_font_style = format('{0}px Georgia', label_font_size);
            var label_point_padding = 2;

            inner_graph_box.inside(ctx, function (ctx, env) {
                //draw arrow
                var arrow_padding = 10;
                var arrow_originate = point(0, env.height());
                var arrow_config = {l: 10, a: Math.PI / 6}
                //y axis arrow
                arrow(ctx, arrow_originate, point(0, arrow_padding), arrow_config);
                // x axis arrow
                arrow(ctx, arrow_originate, point(env.width() - arrow_padding, env.height()), arrow_config);

                //draw graph
                var y_max = max.apply(this, items);
                var y_min = min.apply(this, items);
                var y_pure_length = env.height() - arrow_config.l * Math.cos(arrow_config.a);
                var y_data_padding = (y_max - y_min) * 0.1;

                var ydata_to_px = function () {
                    var data_to_px_gap = y_pure_length / (y_max - y_min + y_data_padding);
                    return function (data) {
                        return env.height() - (data - y_min) * data_to_px_gap;
                    };
                }();
                var x_pure_length = env.width() - arrow_config.l * Math.cos(arrow_config.a);
                var xdata_to_px = function () {
                    var data_padding = 1;
                    var data_to_px_gap = x_pure_length / (items.length + data_padding);
                    return function (index) {
                        return index * data_to_px_gap;
                    };
                }();
                var get_label_pos = function (text, point) {
                    var text_width = ctx.measureText(text).width;
                    return {
                        x: point.x - text_width / 2,
                        y: point.y - label_point_padding - label_font_size
                    };
                };
                var points = map(function (data) {
                    return point(xdata_to_px(data[0]), ydata_to_px(data[1]));
                }, zip(x_index, items));
                paint.lines(ctx, points);
                var old_style = ctx.fillStyle;
                ctx.beginPath();
                ctx.fillStyle = colors[0];
                for (var i = 0; i < points.length; i++) {
                    var p = points[i];
                    ctx.moveTo(p.x, p.y);
                    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
                    if (p.x != 0) {
                        var label_point = get_label_pos(items[i], p);
                        ctx.fillText(items[i], label_point.x, label_point.y);
                    }
                    ctx.fill();
                }
                ctx.fillStyle = old_style;

                var draw_yaxis = function () {
                    var yaxis_scale_length = 5;
                    var top_label = y_max;
                    var bottom_label = y_min;
                    var data_gap = (top_label - bottom_label) / 5;
                    var y_axis_labels = [];
                    for (var i = y_min; i <= top_label; i += data_gap) {
                        var y_px = ydata_to_px(i.toFixed(0));
                        y_axis_labels.push([i.toFixed(0), yaxis_box.to_box(env, point(0, y_px))]);
                        paint.line(ctx, point(0, y_px), point(yaxis_scale_length, y_px));
                    }

                    yaxis_box.inside(ctx, function (ctx, y_env) {
                        var label_axis_padding = 4;
                        foreach(function (y_label_pos) {
                            var label = y_label_pos[0];
                            var pos = y_label_pos[1];
                            var label_width = ctx.measureText(label).width;
                            var label_pos = point(pos.x - label_width - label_axis_padding, pos.y);
                            ctx.textBaseline = "middle";
                            ctx.fillText(label, label_pos.x, label_pos.y);
                        }, y_axis_labels);
                    }, env);
                }();
                var draw_xaxis = function () {
                    var xaxis_scale_length = 5;
                    var x_labels_pos = map(function (idx) {
                        var x_px = xdata_to_px(idx);
                        paint.line(ctx, point(x_px, env.height()), point(x_px, env.height() - xaxis_scale_length));
                        return xaxis_box.to_box(env, point(x_px, env.height()));
                    }, x_index);
                    xaxis_box.inside(ctx, function (ctx, x_env) {
                        var label_axis_padding = 10;
                        for (var i = 0; i < x_labels_pos.length; i++) {
                            var label_pos = x_labels_pos[i];
                            var label = x_label[i];
                            var text_width = ctx.measureText(label).width;
                            label_pos = point(label_pos.x, label_axis_padding);
                            ctx.textBaseline = "middle";
                            ctx.fillText(label, label_pos.x, label_pos.y);
                        }
                    }, env);
                }();
            });

        };
        var draw = function (items, x_axis) {
            var colors = gen_colors([items]);
            draw_graph(items, x_axis, colors);
//            draw_legend(ctx, get_text_frame(), text_box, text_style, items, colors);
        };
        return {
            draw: draw
        }
    }
    return {
        piechart: piechart,
        barchart: barchart,
        linechart: linechart
    }
});