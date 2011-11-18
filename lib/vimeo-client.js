var oauth = require('oauth')
,   sys = require('sys')
,		colorlog = require('colorlog')
,   clog = null
,   consumer = null
,   options = {}
,   apiHost = 'http://vimeo.com/api/rest/v2';


exports.login = function(req, res) {
	return consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
		if (error) {
			
			clog.error("login error %s", error);
			
			return exports.sendError(req, res, "Error getting OAuth request token : " + sys.inspect(error), 500);
			
		} else {
			
			req.session || (req.session = {});
			req.session.oauthRequestToken = oauthToken;
			req.session.oauthRequestTokenSecret = oauthTokenSecret;
			
			return res.redirect("http://vimeo.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken + "&permission=" + options.permission);
		}
	});
};


exports.middleware = function(_options) {
	
	options = _options || {};
	
	clog = new colorlog(options.logging ? options.logging : 'emergency');
	
	consumer = new oauth.OAuth("http://vimeo.com/oauth/request_token", "http://vimeo.com/oauth/access_token", options.consumerKey, options.consumerSecret, "1.0A", "" + options.baseURL + "/vimeo/callback", "HMAC-SHA1");

	return function(req, res, next) {
		
		var action;
		
		if (req.url === '/vimeo/login') {
			action = exports.login;
		} 
		
		else if (req.url === '/vimeo/logout') {
			action = exports.logout;
		} 
				
		else if (req.url.match(/^\/vimeo\/callback/)) {
		  action = exports.callback;
		}
		
		return action ? action(req, res) : next();
		
	};
}



exports.callback = function(req, res) {
	return consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(err, oauthAccessToken, oauthAccessTokenSecret, results) {
		if (err) {
			exports.sendError(req, res, ("Error getting OAuth access token : " + (sys.inspect(err))) + ("[" + oauthAccessToken + "] [" + oauthAccessTokenSecret + "] [" + (sys.inspect(results)) + "]"));
		}
		
		req.session.vimeo = {
			accessToken: oauthAccessToken,
			accessTokenSecret: oauthAccessTokenSecret,
			name: results.screen_name
		};
		
		res.redirect(options.afterLogin);
		clog.info("Redirected to " + options.afterLogin);
		
	});
};



exports.sendError = function(req, res, err) {
	if (err) {
		
		clog.error("Login error " + err);
		
		if (process.env['NODE_ENV'] === 'development') {
			
			return res.send("Login error: " + err, 500);
			
		} else {
			
			return res.send('<h1>Sorry, a login error occurred</h1>', 500);
			
		}
		
	} else {
		
		clog.error("Login error " + err);
		return res.redirect('/');
		
	}
};

apiOptions = function(api_options) {
	  var api_query = "";
	  
	  for(key in api_options) {
			api_query += key + "=" + encodeURIComponent(api_options[key]) + "&"
		}
		
		return api_query;
	  
}


exports.get = function(api_options, req, callback) {
	
	var api_query = apiOptions(api_options);
	
	if (req.session.vimeo == null) {
		return callback('vimeo session not found');
	}
	
	return consumer.get(apiHost + "?format=json&" + api_query + "user_id=" + req.session.vimeo.accessTokenSecret , req.session.vimeo.accessToken, req.session.vimeo.accessTokenSecret, function(err, data, response) {
		return callback(err, data, response);
	});

};

exports.post = function(api_options, req, callback) {
	
	var api_query = apiOptions(api_options);
	
	if (req.session.vimeo == null) {
		return callback('vimeo session not found');
	}
	return consumer.post(apiHost + "?format=json&" + api_query + "user_id=" + req.session.vimeo.accessTokenSecret , req.session.vimeo.accessToken, req.session.vimeo.accessTokenSecret, '', function(err, data, response) {
		return callback(err, data, response);
	});

};




