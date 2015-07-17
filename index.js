var highland = require('highland');


var builder = function (o) {
    if (streamed_objects.length == 0 ) {
        requestAnimationFrame(track);
    }
    var objects = []
    if (o instanceof Array) {
        objects = o;
    }
    else {
        objects.push(o);
    }

    var make_stream = function(object) {
        var s = highland()
        s._mark = object;
        return s;
    }

    objects.forEach(function (object) {
        streamed_objects.push(object);


        var po_stream = make_stream(object);
        
        
        object.motion = []
        object.motion.push(po_stream)

        var source_stream = highland();
        source_stream._mark = object;
        object.motion.source = source_stream;

        source_stream.on('data', function(m) {
            if (m.position) {
                source_stream._mark.position.x = m.position.x; 
                source_stream._mark.position.y = m.position.y; 
                source_stream._mark.position.z = m.position.z; 
            }
            if ( m.quaternion) {
                source_stream._mark.quaternion.copy(m.quaternion);
            }
        });
    })
}

var streamed_objects = [];
var source_streams = [];

var track = function () {
    var now = Date.now()
    streamed_objects.forEach(function(object){
        object.motion[0].write({object:object, time:now, position: object.position, quaternion:object.quaternion});
    });
    requestAnimationFrame(track);
}

exports.stream = builder;
exports.PO = 0
exports.VEL = 1
exports.ACC = 2