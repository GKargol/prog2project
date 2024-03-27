## Overview

This file provides the technical documentation for a web application built with Node.js, utilizing the Express framework, MongoDB, EJS (Embedded JavaScript), and several other middleware and libraries for session management, password encryption, and environment variable management. The application features user authentication, session management, data submission to MongoDB, and a dashboard to view submitted data.

## System Requirements

- Node.js
- MongoDB
- npm (Node Package Manager)

## Setup Instructions

1. **Clone the Repository**: Clone the project repository to your local machine.
2. **Install Dependencies**: Navigate to the project directory in your terminal and run `npm install` to install the required dependencies.
3. **Environment Variables**: Create a `.env` file in the root directory of the project. This file should contain:
   - `PORT`: The port number on which the server will listen.
   - `SESSION_SECRET`: A secret key for session management.
   - `MONGODB_URI`: The connection URI for MongoDB.
4. **Start the Server**: Run `node server.js` to start the server. The application will be accessible at `http://localhost:<PORT>` where `<PORT>` is the port number specified in your `.env` file or 3000 if none is specified.

## Application Structure

### Middleware Configuration

The application uses various middlewares for handling requests, responses, and sessions:

- `express.static`: Serves static files from the specified directory.
- `express.urlencoded` and `express.json`: Parses incoming requests with urlencoded payloads and JSON payloads, respectively.
- `session`: Manages user sessions with a secret key.

### View Engine

- EJS is configured as the view engine, allowing for dynamic rendering of HTML pages based on server-side data.

### Database Connection

- A function `connectToDatabase` is defined to asynchronously connect to MongoDB using the URI provided in the environment variables.

### Routes

- **Login Page (`/login`)**: Renders the login view.
- **Login Authentication (`/login` POST)**: Authenticates the user. This example uses hard-coded credentials for demonstration.
- **Logout (`/logout`)**: Destroys the user's session and redirects to the login page.
- **Data Submission (`/submit` and `/submit2` POST)**: Accepts form data and inserts it into specified MongoDB collections.
- **Dashboard (`/dashboard`)**: Renders the dashboard view with data fetched from MongoDB based on the authenticated user's session.

### Server Initialization

- The server listens on the specified port and logs a message to the console when it starts.

## Dependencies

List of major dependencies with specified versions:

- `bcrypt@5.1.1`: Library for hashing passwords.
- `body-parser@1.20.2`: Middleware to parse incoming request bodies before your handlers, available under the req.body property.
- `chai@5.0.0`: A BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.
- `dotenv@16.4.5`: Loads environment variables from a `.env` file into `process.env`.
- `ejs@3.1.9`: Embedded JavaScript templates for generating HTML markup with plain JavaScript.
- `express-session@1.18.0`: Session management middleware for Express.
- `express@4.18.2`: Web application framework for Node.js.
- `mocha@10.2.0`: JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple.
- `mongodb@6.3.0`: MongoDB driver for Node.js, provides a high-level API on top of mongodb-core that is meant for end users.
- `mongoose@8.0.4`: MongoDB object modeling tool designed to work in an asynchronous environment.

Note: Ensure that all dependencies are installed to their specified versions to avoid compatibility issues.

## Testing Instructions

- First download the full code as a zip
- Next unzip and open the folder in VSC
- Click trust author and load the files
- Once everything shows in the VSC window, open a new terminal
- In terminal, make sure you have NodeJS and NPM installed
- Use `npm i` to install all dependencies. Then run `npm i dotenv ejs` to download all needed dependencies.
- To start testing, use `node server.js` to open a local port via express. "Go Live" plugin will not work due to listing on a different port.

## Additional Notes

### Todo

- Other formatting and cleaning comments
- Final theme and CSS for forms and dashboard
- Accessibility features
- Statsheet table view for dashboard
- Statsheet form pages
