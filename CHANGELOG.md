# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add classroom handling in dashboard
- Dashboard is now responsive to be usable on smartphone
- Seed script to create users/classrooms from a CSV file

### Changed
- Improved welcome message on command line: banner, version, settings
- Improved resilience, detect: missing settings file, port already in use, fatal error, ...
- node.js 4 is no longer supported, version 6 is the new minimum
- MongoDB 2.4 is no longer supported, version 2.6 is the new minimum
- Go to User journal/Launch activity when clicked on Dashboard chart
- Better handling localization on Dashboard
- General improvement on Dashboard UI

### Fixed
- Admin can signup from remote address
- Client IP is wrong when coming from nginx
- node.js 10 is now supported #18
- npm 6.2.0 says sugarizer-server has 1 "critical vulnerability" #10
- Can't create a classroom with a space into the dashboard #19
- Error in dashboard when deleting a classroom #20
- Missing message string in dashboard on delete #21
- Consistency in language of users #33
- Server hangs/crashes on when an admin delete its own account
- Add size column in Dashboard Journal view #84
- Statistics page shows all users as inactive #95
- Use a random color for new user/classroom created from dashboard enhancement #166
- Stats on how users are launching activities are incorrect #119
- No message when searched activity is not found enhancement to be release #112
- Better UI to organize activities in dahsboard #87
- Go to User journal/Launch activity when clicked on chart enhancement #84
- Language switching not handled properly #42
- Show no result found message rather than Showing table headings #39
- Inconsistency in language of users in dashboard #33


## [1.0.1] - 2018-07-14
### Added
- Add a secure parameter to /api to know if server is secured
- Add a waitDB parameter to wait for DB connection before starting

### Changed
- Safe restart of MongoDB Docker
- Update MongoDB driver to 2.x


## [1.0] - 2018-05-16
### Added
- Separation from Sugarizer repository
- Standalone server (Apache server no longer need)
- Handle login/password
- Full dashboard with information on activities, users and journal
- SSL support

### Changed
- Improved API
- Docker now need only 2 containers
- .ini file location now depend of NODE_ENV variable
