const ErrorStackParser = require( "error-stack-parser" );
const axios = require( "axios" );

class Stachebox {
	constructor( options ){

		this._config = {
			endpoint : "/stachebox/api/v1/logs",
			token : "",
			application : "stachebox",
			release : "",
			type : "javascript",
			environment : "production"
		}
	
		Object.assign( this._config, options );
	
	}

	log( entry ){
		var logEntry;
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		if( entry instanceof Error ){
			let stackFrames = ErrorStackParser.parse( entry );
			logEntry = {
				application : this._config.application,
				level : entry.level || 'ERROR',
				type : this._config.type,
				release : this._config.release,
				message : entry.message,
				stacktrace : entry.stack,
				frames : stackFrames.map(
					frame => {
						return {
							columnNumber : frame.columnNumber,
							fileName : frame.fileName,
							functionName : frame.functionName,
							lineNumber : frame.lineNumber,
							source : frame.source
						};
					}
				),
				event : {
					name :  stackFrames[ 0 ].functionName,
					route : window ? window.location.pathname : "",
					routed_url : window ? window.location.href : "",
					environment : this._config.environment
				}
			}
		} else {
			logEntry = entry;
		}
	
		return axios.post(
			this._config.endpoint,
			JSON.stringify( { entry : logEntry } ),
			{ headers : { "Authorization" : "Bearer " + this._config.token, "Content-Type" : 'application/json' } }
		);
	}

	error( entry ){ 
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		entry.level = 'ERROR';
		return this.log( entry );
	}

	warn( entry ){ 
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		entry.level = 'WARN';
		return this.log( entry );
	}

	info( entry ){ 
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		entry.level = 'INFO';
		return this.log( entry );
	}
}

module.exports = Stachebox;
