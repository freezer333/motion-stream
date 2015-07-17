# Streaming object motion

The `stream` function attaches several streams to an object which report position, velocity, and acceleration.  The streams are implemented with [highland](http://highlandjs.org/), and you can hook into them under the `motion` object of the THREE.js object once created.

Motion output streams
- motion[0] is the position and orientation stream
- motion[1] is the translation and angular velocity stream
- motion[2] is the translation and angular acceleration stream

the motion object exported from the module also included constants PO  = 0, VEL = 1, ACC = 2 for convenience.

**Important:**  When consuming the motion streams, you must call `fork` on the stream.  The velocity streams are already pulling from the position/orientation streams, and the acceleration streams are already sourcing the velocity streams - so you'll get a "multiple consumer" error if you do not use fork!

Below is a simple example that pipes the position data of an object to standard out.

```js
var motion = require('motion-stream');

// Any THREE.js Object3d will do...
mesh = new THREE.Mesh(geometry, material);

// attaches motion streams to mesh
motion.stream(mesh);  

// pipe position to stdout
mesh.motion[0].fork().map(
        function(o){
            return JSON.stringify(o.position) + "\n"
        }).pipe(process.stdout);
```

The following would pipe the translational velocity of the same mesh

```js
mesh.motion[1].fork().map(
        function(velocity){
            return JSON.stringify(velocity.translation) + "\n"
        }).pipe(process.stdout);

```

# Controlling motion of object 
motion also adds a `source` stream to the object, which will be used to control the object's position/orientation.  You can pipe another motion stream into the source stream to have one object follow another.  You can use the standard highland mapping functionality to add transformations.  

For example, you can have one object's position mirror another's by doing a simple negation:

```js
var motion = require('motion-stream');

mesh1 = new THREE.Mesh(geometry, material);
mesh2 = new THREE.Mesh(geometry, material);

//... add them to the scene... etc.

// you can stream multiple objects with one call by passing an array
motion.stream([mesh1, mesh2]);

mesh1.motion[0].map(
    function (x) {
        return  {
                    position: x.position.negate(), 
                    quaternion: x.quaternion.inverse()
                }
    }
).pipe(mesh2.motion.source);
```