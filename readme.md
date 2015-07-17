# Basic Usage

```js
var motion = require('motion-stream');

// Any THREE.js Object3d will do...
mesh = new THREE.Mesh(geometry, material);

// attaches motion.pos, motion.velo, motion.acc streams to object
motion.stream(mesh);  

// pipe position to stdout
mesh.motion.pos.map(
        function(x){
            return JSON.stringify(x.position) + "\n"
        }).pipe(process.stdout);
```

# Controlling motion of object 

motion also adds a "source" stream to the object, which will be used to control the object's position/orientation.  You can pipe another motion stream into the source stream to have one object follow another.  You can use the standard highland mapping functionality to add transformations.  

For example, you can have one object's position mirror another's by doing a simple negation:

var motion = require('motion-stream');

mesh1 = new THREE.Mesh(geometry, material);
mesh2 = new THREE.Mesh(geometry, material);

//... add them to the scene... etc.

```js
motion.stream(mesh1);
motion.stream(mesh2);

mesh1.motion.pos.map(
    function (x) {
        return {position: x.position.negate()}
    }
).pipe(mesh2.motion.source);
```