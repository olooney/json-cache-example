var http = require('http');
var url = require('url');

// just start with a few random things defined for testing.
var store = {
	secret: 'hey! this was supposed to be a secret!',
	quote1: { quote: "Walking on water and developing software from a specification are easy if both are frozen.", author: "Edward V Berard" },
	quote2: { quote: "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.", author: "Brian Kernighan" },
	quote3: { quote: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" }
};

var server = http.createServer(function(request, response) {
	try { 
		var id = url.parse(request.url).pathname;
		if ( id.charAt(0) === '/' ) id = id.slice(1);
		if ( id.charAt(id.length-1) === '/' ) id = id.slice(0, id.length-1);

		// as a special case, server client.html as a static HTML page.
		if ( id === 'client.html'	) {
			var fs = require('fs');
			fs.readFile('client.html', function(error, data) {
				response.writeHead(200, {'content-type': 'text/html' });
				response.end(data);
			});
		} else {
			if ( request.method === 'POST' ) {
				// the body of the POST is JSON payload.  It is raw, not multipart encoded.
				var data = '';
				request.addListener('data', function(chunk) { data += chunk; });
				request.addListener('end', function() {
					store[id] = JSON.parse(data);
					response.writeHead(200, {'content-type': 'text/plain' });
					response.end()
				});
			} else if ( request.method === 'GET' ) {
				// exact id lookup.
				if ( id in store ) {
					response.writeHead(200, {'content-type': 'text/json' });
					response.write( JSON.stringify(store[id]) );
					response.end('\n');
				} else {
					response.writeHead(404, {'content-type': 'text/plain' });
					response.write('no data for ' + id);
					response.end('\n');
				}
			} else {
				response.writeHead(404);
				response.end('bad method');
			}
		}
	} catch ( e ) {
		response.writeHead(500, {'content-type': 'text/plain' });
		response.write('ERROR:' + e);
		response.end('\n');
	}
});

server.listen(8181);
console.log("Go to http://127.0.0.1:8181/client.html to see the client test page.")
