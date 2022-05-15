# Landscape

An Node.js-Express-Mongo app for sharing landscapes from around the world

check out the heroku hosted app at https://landscapes-view.herokuapp.com

# Code Overview

## Dependencies

- [expressjs](https://www.npmjs.com/package/express) - The server for handling and routing HTTP requests
- [express-session](https://www.npmjs.com/package/express-session) - A node.js module middleware for handling sessions compatible with Express 
- [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize) - Express 4.x middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection
- [connect-mongo](https://www.npmjs.com/package/connect-mongo) MongoDB session store for Connect and Express.
- [mongoose](https://www.npmjs.com/package/mongoose) - For modeling and mapping MongoDB data to javascript
- [passport](https://www.npmjs.com/package/passport) - Express-compatible authentication middleware for Node.js
- [passport-local](https://www.npmjs.com/package/passport-local) - [passport](http://passportjs.org/) strategy for authenticating with a username
and password
- [passport-local-mongoose](https://www.npmjs.com/package/passport-local-mongoose) - [mongoose](http://mongoosejs.com/) [plugin](http://mongoosejs.com/docs/plugins.html) that simplifies building username and password login with [passport](http://passportjs.org)
- [method-override](https://www.npmjs.com/package/method-override) - Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
- [ejs](https://www.npmjs.com/package/ejs) - Embedded JavaScript templates
- [ejs-mate](https://www.npmjs.com/package/ejs-mate) - Express 4.x layout, partial and block template functions for the EJS template engine.
- [dotenv](https://www.npmjs.com/package/dotenv) - module that loads environment variables from a .env file into process.env.
- [connect-flash](https://www.npmjs.com/package/connect-flash) - Flash messages are stored in the session
- [multer](https://www.npmjs.com/package/multer) - Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
- [cloudinary](https://www.npmjs.com/package/cloudinary) - allows you to quickly and easily integrate your application with Cloudinary 
- [multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary) - A multer storage engine for Cloudinary
- [sanitize-html](https://www.npmjs.com/package/sanitize-html) - provides a simple HTML sanitizer with a clear API
- [joi](https://www.npmjs.com/package/joi) - schema description language and data validator for JavaScript
- [@mapbox/mapbox-sdk](https://www.npmjs.com/package/@mapbox/mapbox-sdk) - A JS SDK for working with Mapbox APIs

## Application Structure

- `app.js` - The entry point to our application. This file configuring mongoose, session, etc. It starts the server and handling errors. 
- `routes/` - This folder contains the route definitions for our API.
- `models/` - This folder contains the schema definitions for our Mongoose models.
- `conrollers/` - This folder contains the routes logic.
- `middleware.js` - This file contains the middleware for the routes

## Error Handling

- ExpressError class - A class which represents an error.
- catchAsync - a wrapper function that passes the error to the error handle middleware
- error middleware - a middleware that renders the error view with a message.

## Authentication

Utilize [passport](https://www.npmjs.com/package/passport) and [passport-local](https://www.npmjs.com/package/passport-local) strategy to authenticate users.

## Authorization

Utilize middleware to authorize only the author to change a landscape.