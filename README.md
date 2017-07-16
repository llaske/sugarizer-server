# Sugarizer Server

Repository for Sugarizer Server API and Server Dashboard.

## Requirements

This project require npm 4+.

## Installation

Run following command in `terminal`.

    npm install

To test the API, run following command in `terminal`.

    npm test

To generate docs, run following command in `terminal`.

    apidoc -i api/controller -o docs/www/

## Running the server

Run following command in `terminal`.

    node sugarizer.js

Then navigate to postman to start making calls to REST API and to http://localhost:{PORT}/ to access sugarizer dashboard.

## License

This project is licensed under `Apache` License. See LICENSE for full license text.
