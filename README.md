# Tech Documentation

## Overview

This document serves as the technical documentation for a Node.js web application using the Express framework. It includes user authentication, session management, data handling with MongoDB, and dynamic content rendering using EJS. The application is designed to demonstrate fundamental web development concepts with Node.js.

## System Requirements

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **MongoDB**: A NoSQL database used for storing application data.
- **npm (Node Package Manager)**: A package manager for JavaScript, used to install modules.

## Setup Instructions

1. **Clone the Repository**: Clone the project repository using `git clone <repository-url>`.
2. **Install Dependencies**: Navigate to the project directory in your terminal and execute `npm install` to install the necessary dependencies.
3. **Environment Variables**:
   - Create a `.env` file in the project root.
   - Define the following variables:
     - `PORT`: The port number on which the server will listen.
     - `SESSION_SECRET`: A secret key for session management.
     - `MONGODB_URI`: The URI for MongoDB connection.
4. **Start the Server**: Execute `node server.js` to start the server. Access the application at `http://localhost:<PORT>` (replace `<PORT>` with your port number).

## Application Structure

### Middleware Configuration

- `express.static`: Serves static files.
- `express.urlencoded` and `express.json`: Parse incoming requests with URL-encoded and JSON payloads, respectively.
- `session`: Manages user sessions.

### View Engine

- **EJS**: Used for dynamic HTML rendering based on server-side data.

### Database Connection

- Uses `MongoClient` from the `mongodb` module to connect to MongoDB using credentials stored in environment variables.

### Routes

#### Authentication and Session Management

- **`GET /login`**: Renders the login view.
- **`POST /login`**: Authenticates the user using hard-coded credentials for demonstration purposes. Redirects to the dashboard upon successful login.
- **`GET /logout`**: Destroys the user's session and redirects to the login page.

#### Data Submission

- **`POST /submit`**: Accepts form data related to general entries and inserts it into the MongoDB `formdatas` collection.
- **`POST /submit2`**: Handles submissions specifically for statsheet entries and inserts them into the `statsheet` collection.

#### Data Management and Visualization

- **`GET /dashboard`**: Displays a dashboard that provides an overview of data fetched from MongoDB based on the authenticated user's session information.

#### PDF Generation

- **`GET /download-pdf`**: Generates a downloadable PDF document representing the data of a specific entry. This route dynamically handles data based on the `statsheet` or `formdatas` collections, depending on the user's session and the specified index.

#### Data Deletion

- **`DELETE /deleteFormsEntry/:entryId`**: Deletes a specific entry from the `formdatas` collection using the MongoDB `_id` provided as a parameter. Responds with appropriate success or failure status.
- **`DELETE /deleteStatsEntry/:entryId`**: Similarly, this route deletes an entry from the `statsheet` collection. It ensures that only authorized deletions are processed, protecting data integrity.

### Server Initialization

- The server is configured to listen on the specified port, with environmental variables managing key configurations. It provides console feedback upon startup to confirm that it is running correctly.

## Dependencies

- `express`: Framework for building web applications.
- `mongoose`: ODM for MongoDB.
- `bcrypt`: Used for hashing passwords.
- `express-session`: Manages sessions across HTTP requests.
- `dotenv`: Loads environment variables from `.env`.
- Other dependencies like `body-parser`, `chai`, `ejs`, `mocha`, `mongodb`, `pdfkit` provide additional functionality.

## Testing Instructions (If downloaded ZIP file and skipped Setup Instructions)

1. Download and unzip the full code.
2. Open the folder in Visual Studio Code and trust the author if prompted.
3. Install NodeJS and npm if not already installed.
4. Use `npm install` in the terminal within your project directory to install dependencies.
5. Run `node server.js` to start the server and access the app via `localhost` on the specified port.

## Additional Notes

Remember to keep dependencies up to date and test frequently for any security issues or bugs.
If you encounter issues with PDF download, simply click "View Next Entry" to ensure the URL is set to the current entry you are viewing.
