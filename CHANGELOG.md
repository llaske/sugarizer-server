# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add classroom handling in dashboard

### Changed
- Improved welcome message: banner, version, settings
- node.js 4 is no longer supported, version 6 is the new minimum

### Fixed
- Admin can signup from remote address
- Client IP is wrong when coming from nginx
- node.js 10 is now supported


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
