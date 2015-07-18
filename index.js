var highland = require('highland');


var builder = function (o, opts) {
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

    var params = {
        translation_velocity_window : (opts && opts.translation_velocity_window) || 500, 
        rotational_velocity_window : (opts && opts.rotational_velocity_window) || 500
    }
    
    objects.forEach(function (object) {
        streamed_objects.push(object);


        var po_stream = make_stream(object);
        var velocity_stream = make_stream(object);
        
        
        object.motion = [];
        object.motion.push(po_stream);
        object.motion.push(velocity_stream);


        var vel = {
            window: params.translation_velocity_window, 
            positions : []
        }
        var track_velocity = function(object) {
            now = Date.now()
            baseline = -1

            for (var i = 0; i < vel.positions.length; i++) {
                p = vel.positions[i]
                if (now - p.time > vel.window) {
                    baseline = i;
                }
                else if (now - p.time < vel.window) {
                    break;
                }
            }
            vel.positions.push({
                time : now,
                position: new THREE.Vector3(object.position.x, object.position.y, object.position.z)
            });
            velocity = new THREE.Vector3();
            
            if (baseline >= 0) {
                last = vel.positions.length-1;
                time_delta = (now - vel.positions[baseline].time) * 1000;
                velocity = new THREE.Vector3(
                    (vel.positions[last].position.x - vel.positions[baseline].position.x)/time_delta, 
                    (vel.positions[last].position.y - vel.positions[baseline].position.y)/time_delta, 
                    (vel.positions[last].position.z - vel.positions[baseline].position.z)/time_delta
                )
                    
                    
                vel.positions = vel.positions.slice(baseline);

            }
            
            return { object : object.object, time:object.time, translation : velocity}
        }
        
        object.motion[0].fork().map(track_velocity).pipe(object.motion[1]);

        var source_stream = make_stream(object);
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