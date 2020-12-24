const Stachebox = require("./stachebox");
const path = require("path");

const logger = new Stachebox( { token : "XYZ" } );

var error;
try{
    throw( new Error( "Boom goes the javascript" ) )
} catch( err ){
  error = err;
}

test( "it can log an error", () => {
    let p = logger.log( error );
});

test( "it can log a string", () => {
    let p = logger.log( "Boom goes the javascript" );
});

test( "stachebox.error", () => {
    let p = logger.error( "Boom goes the javascript" );
} );


test( "stachebox.warn", () => {
    let p = logger.error( "This is your last warning" );
} );


test( "stachebox.info", () => {
    let p = logger.error( "Hello!" );
} );

