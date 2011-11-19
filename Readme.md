vimeo-client
=============

Vimeo Advanced API Client library for Node.js
The library works with all methods provided by Vimeo API and allows you to authenticate via Vimeo.
You will first need to sign up for a [developer application](http://vimeo.com/api/applications) to get the consumer key and secret.

## Installation
    $ npm install everyauth

## Quick Start
You can use Express or Connect with vimeo-client

1. **Add the vimeo-client middleware to Express**
    ```javascript
    var vimeo = require('vimeo-client');
    
    var app = module.exports = express.createServer();
    
    app.configure(function(){
	  
	  // Some your code
	
	  app.use(express.bodyParser());
	  app.use(express.cookieParser());
	  app.use(express.session({ secret: 'secret'}));
	  app.use(vimeo.middleware({
		  consumerKey: 'YOUR CONSUMER KEY',
		  consumerSecret: "YOUR CONSUMER SECRET",
		  baseURL: 'http://localhost:3000',
		  logging: 'debug',  //Set logging: false to disable console logs
		  afterLogin: '/helloVimeo',
		  afterLogout: '/goodbyeVimeo',
		  permission: 'write' // Vimeo API provide 3 level of permissions 'read, write, delete'
		}));
	});
	
2. **Use vimeo API**
    ```javascript
    app.get('/hello', function(req, res){
	
	 	vimeo.post({method: "vimeo.albums.create", description: "My Music Videos", title: "My Music Videos", video_id: "29020150", videos: "15877632, 29020150, 
	16097839"}, req, function(err, data, response) {
		     res.send(data);
		 });
		 
	});

**About options**
 - `method:` - Some Vimeo API method, a description of all methods can be found on [Vimeo API Method list](http://vimeo.com/api/docs/methods)
The `method:` must be the first since you can specify other options, like `video_id:.....etc`.

### License
MIT License

---
### Author
Andriy Bazyuta