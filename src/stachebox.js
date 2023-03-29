const ErrorStackParser = require( "error-stack-parser" );
const axios = require( "axios" );

class Stachebox {
	constructor( options ){

		this._config = {
			endpoint : "/stachebox/api/v1/logs",
			token : "",
			application : "stachebox",
			release : null,
			type : "javascript",
			environment : "production",
			transmissionMethod : "api"
		}

		Object.assign( this._config, options );

	}

	log( entry ){
		var logEntry;
		var creationTime = new Date().toISOString().split('.')[0]+"Z";
		if( entry instanceof Error ){
			let stackFrames = ErrorStackParser.parse( entry );
			logEntry = {
				"@timestamp" : creationTime,
				"labels" : {
					"application" : this._config.application,
					"environment" : this._config.environment.toLowerCase()
				},
				"log" : {
					"level" : entry.level || 'ERROR',
					"logger": "stachebox-npm",
				},
				"package" : {
					"type" : this._config.type,
					"version" : this._config.release,
					"path" : window ? window.location.pathname : null
				},
				"event" : {
					"created" : creationTime
				},
				"url" : {
					"domain" : window ? window.location.hostname : null,
					"path" : window ? window.location.pathname : null,
					"port" : window ? window.location.port : null,
					"query" : window ? window.location.search : null,
					"scheme" : window ? window.location.protocol : null
				},
				"message" : entry.message,
				"host" : {
					"name" : window ? window.location.hostname : null
				},
				"user_agent" : {
					"original" : window ? window.navigator.userAgent : null
				},
				"error" : {
					"level"   : entry.level || 'ERROR',
					"type" 	  : entry.constructor ? entry.constructor.name : 'Error',
					"message" : entry.message,
					"stack_trace" : entry.stack,
					"frames" : stackFrames.map(
						frame => {
							return {
								"abs_path"     : frame.fileName,
								"filename"     : frame.fileName,
								"functionname" : frame.functionName,
								"lineno"       : frame.lineNumber,
								"columnno" : frame.columnNumber,
								"pre_context"  : [],
								"context_line" : frame.source,
								"post_context" : [],
							};
						}
					)
				}
			}
		} else {
				logEntry = {
					"@timestamp" : creationTime,
					"labels" : {
						"application" : this._config.application,
						"environment" : this._config.environment.toLowerCase()
					},
					"log" : {
						"level" : "ERROR",
					},
					"message" : typeof entry === 'string' ? entry : entry.message,
					"package" : {
						"type" : this._config.type,
						"version" : this._config.release,
						"path" : window ? window.location.pathname : null
					},
					"event" : {
						"created" : creationTime
					},
					"url" : {
						"domain" : window ? window.location.hostname : null,
						"path" : window ? window.location.pathname : null,
						"port" : window ? window.location.port : null,
						"query" : window ? window.location.search : null,
						"scheme" : window ? window.location.protocol : null
					},
					"host" : {
						"name" : window ? window.location.hostname : null
					},
					"user_agent" : {
						"original" : window ? window.navigator.userAgent : null
					}
				};
				if( typeof entry === 'object' ){
					Object.assign( logEntry, entry );
				}
		}

		return axios.post(
			this._config.endpoint,
			this._config.transmissionMethod == "api" ? JSON.stringify( { entry : logEntry } ) : JSON.stringify( logEntry ),
			{ headers : { "Authorization" : "Bearer " + this._config.token, "Content-Type" : 'application/json' } }
		);
	}

	error( entry ){
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		entry.log = {
			level : 'ERROR'
		};
		return this.log( entry );
	}

	warn( entry ){
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		entry.log = {
			level : 'WARN'
		};
		return this.log( entry );
	}

	info( entry ){
		if( typeof entry === 'string' ){
			entry = {
				"message" : entry
			};
		}
		entry.log = {
			level : 'INFO'
		};
		return this.log( entry );
	}
}

module.exports = Stachebox;
