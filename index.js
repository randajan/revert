import slib, { argv } from "@randajan/simple-lib";


const { isBuild } = argv;

slib(isBuild, {
    mode: "node",
    lib:{
        minify:false,
        entries:[
            "sync/index.js",
            "sync/utils.js",
            "async/index.js",
            "async/utils.js"
        ]
    }
});

