# Usage

```js
var motion = require('motion-stream');

// attaches motion.pos, motion.velo, motion.acc streams to object
motion.stream(mesh);  

// pipe position to stdout
mesh.motion.pos.map(
        function(x){
            return JSON.stringify(x.position) + "\n"
        }).pipe(process.stdout);
```
