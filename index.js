var highland = require('highland');


var builder = function (object) {
    if (streams.length == 0 ) {
        requestAnimationFrame(track);
    }
    
    var new_stream = highland();
    new_stream._mark = object;
    streams.push(new_stream);
    object.motion = {
        pos: new_stream
    }
    return new_stream;
}

var streams = [];

var track = function () {
    var now = Date.now()
    streams.forEach(function(stream){
        stream.write({object:stream._mark, time:now, position: stream._mark.position});
    });
    requestAnimationFrame(track);
}

exports.stream = builder;