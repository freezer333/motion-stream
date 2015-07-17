var highland = require('highland');


var builder = function (o) {
    if (streams.length == 0 ) {
        requestAnimationFrame(track);
    }
    var objects = []
    if (o instanceof Array) {
        objects = o;
    }
    else {
        objects.push(o);
    }

    objects.forEach(function (object) {
        var new_stream = highland();
        new_stream._mark = object;
        streams.push(new_stream);
        object.motion = {
            pos: new_stream
        }

        var source_stream = highland();
        source_stream._mark = object;
        object.motion.source = source_stream;

        source_stream.on('data', function(m) {
            if (m.position) {
                source_stream._mark.position.x = m.position.x; 
                source_stream._mark.position.y = m.position.y; 
                source_stream._mark.position.z = m.position.z; 
            }
        });
    })
}

var streams = [];
var source_streams = [];

var track = function () {
    var now = Date.now()
    streams.forEach(function(stream){
        stream.write({object:stream._mark, time:now, position: stream._mark.position});
    });
    requestAnimationFrame(track);
}

exports.stream = builder;