![](images/dashboard_capture1.png)

# Sugarizer Server

[Sugarizer](https://github.com/llaske/sugarizer) is the open source learning platform based on Sugar that began in the famous One Laptop Per Child project.

Sugarizer Server allow deployment of Sugarizer on a local server, for example on a school server, so expose locally Sugarizer as a Web Application. Sugarizer Server can also be used to provide collaboration features for Sugarizer Application on the network. Sugarizer Server could be deployed on any computer with Node.js and MongoDB, or in a Docker container.


## Running using Docker

To run Sugarizer Server with a few command lines using Docker and Docker Compose:

**Clone Sugarizer Client and Sugarizer Server**

	git clone https://github.com/llaske/sugarizer
	git clone https://github.com/llaske/sugarizer-server

**Install Docker and Docker Compose on Ubuntu**

	curl -fsSL https://get.docker.com/ | sh

Install Docker Compose

	curl -L "https://github.com/docker/compose/releases/download/1.8.1/docker-compose-$(uname -s)-$(uname -m)" > /usr/local/bin/docker-compose
	chmod +x /usr/local/bin/docker-compose

To install Docker Compose on ARM architectures (e.g. for the Raspberry Pi 3), the link above will not work.  You need to use [arm-compose](https://github.com/hypriot/arm-compose) instead.

You can find more details about the installation of **Docker** [here](https://docker.github.io/engine/installation/)

You can	find more details about	the installation of **Docker Compose** [here](https://docs.docker.com/compose/install/)

After that, go to the Sugarizer Server folder and launch

	cd sugarizer-server
	sh generate-docker-compose.sh
	docker-compose up -d

Your Sugarizer server will start automatically and will be accessible on http://127.0.0.1:8080 and your public IP. The database will be persisted inside the folder docker/db.

## Running using the classic way

To run Sugarizer Server **without Docker**, follow the step behind. Commands are shown from a new Debian Linux machine and could be different for other platforms or for an already installed machine:


**Install Node.js**: Install Node.js and npm to manage packages. See [here](http://nodejs.org/ "here") more information.

    sudo apt-get install nodejs

**Install MongoDB**: Don't forget to create a /data/db directory to store databases. See [here](http://www.mongodb.org/ "here") more information.

    sudo apt-get install mongodb
    sudo mkdir -p /data/db

**Install Sugarizer Client and Server**: If need, you could update sugarizer-server/sugarizer.ini file (update port for web, mongodb or presence, see below)

    sudo apt-get install git
    cd /home/root
    sudo git clone https://github.com/llaske/sugarizer
    sudo git clone https://github.com/llaske/sugarizer-server
    cd /home/root/sugarizer-server
    sudo npm install

**Run MongoDB and Sugarizer Server**:Run mongo daemon and Sugarizer a background process.

    sudo mongod --fork --port 27018 --logpath /home/root/mongo.log
    sudo nohup node sugarizer.js > /home/root/sugarizer.log &

*Warning:* If your server had an unclean shutdown on previous boot,  MongoDB could not start correctly telling that some files are locked. In that case, launch first:

	sudo mongod --repair

**Check your install**: To check your install, run "http://127.0.0.1:8080" in your browser:

* once a new user created, you should see the home with all activities,
* go to Journal view, you should see at the bottom of the screen the two icons to switch to private/shared journal,
* go to the neighborhood view, you should see one icon for the server and one for you.


## Running from a Raspberry Pi

To deploy Sugarizer Server from a Raspberry Pi, a specific packaging name [Sugarizer Schoolbox](https://github.com/llaske/sugarizer-school-box) is available [here](https://github.com/llaske/sugarizer-school-box).

## Running from the cloud

You could install on any existing cloud platform (Amazon, Micrsoft Azure, Google Cloud Platform, ...). Detail of settings for Google Cloud Platform is available [here](docs/deploytoGCP.md). 


## Server settings

Sugarizer settings are load by default from file [env/sugarizer.ini](env/sugarizer.ini). You could change the name of this file by changing the value of environment variable ``NODE_ENV``. So if the ``NODE_ENV`` variable is set to ``production``, Sugarizer will try to load ``env/production.ini`` file.

Following is the typical content of Sugarizer Server settings file:


	[information]
	name = Sugarizer Server
	description = Your Sugarizer Server

	[web]
	port = 8080

	[security]
	min_password_size = 4
	max_age = 172800000
	https = false
	certificate_file = ../server.crt
	key_file = ../server.key
	strict_ssl = false

	[client]
	path = ../sugarizer/

	[presence]
	port = 8039

	[database]
	server = localhost
	port = 27018
	name = sugarizer

	[collections]
	users = users
	journal = journal
	stats = stats
	waitdb = 1

	[statistics]
	active = true

	[activities]
	activities_directory_name = activities
	template_directory_name = ActivityTemplate
	activity_info_path = activity/activity.info
	favorites = org.sugarlabs.GearsActivity,org.sugarlabs.MazeWebActivity,org.olpcfrance.PaintActivity,org.olpcfrance.TamTamMicro,org.olpcfrance.MemorizeActivity,org.olpg-france.physicsjs,org.sugarlabs.CalculateActivity,org.sugarlabs.TurtleBlocksJS,org.sugarlabs.Clock,org.olpcfrance.RecordActivity,org.olpcfrance.Abecedarium,org.olpcfrance.KAView,org.olpcfrance.FoodChain,org.olpc-france.labyrinthjs,org.olpcfrance.TankOp,org.sugarlabs.ChatPrototype,org.olpcfrance.Gridpaint,org.olpc-france.LOLActivity,org.sugarlabs.StopwatchActivity,org.sugarlabs.GTDActivity,org.sugarlabs.Markdown,org.laptop.WelcomeWebActivity

The **[information]** section is for describing your server. It could be useful for clients connected to the server.

The **[web]** section describe the settings of the node.js process. By default, the web server is on the port 8080.

The **[security]** section regroup security settings. `min_password_size` is the minimum number of characters for the password. `max_age` is the expiration time in milliseconds of a session with the client. At the expiration of the session, the client should reenter its password. Default time is 172800000 (48 hours). Parameters `https`, `certificate_file`, `key_file` and `strict_ssl` are explain above.

The **[client]** indicate the place where is located Sugarizer Client. Sugarizer Client is need by the server.

The **[presence]** section describe the settings of the presence server. By default, a web socket is created on port 8039. You need to change this value if you want to use another port.

The **[database]** and **[collections]** sections are for MongoDB settings. You could update the server name (by default MongoDB run locally) and the server port. Names of the database and collections had no reason to be changed. The `waitdb` parameter allow you to force server to wait for the database.

The **[statistics]** section indicate if the server will log client usage.

The **[activities]** section describe information on where to find embedded activities. The favorites value list ids of activities that Web Application users will find by default on the home page. All values are self explained and had no reason to be changed.


## Dashboard

Sugarizer Server Dashboard is an admin tool for teachers and deployment administrator. This dashboard can be used to control and manage the work of learners and manage and analyze all activities on a Sugarizer Server. The Dashboard have following features:

* Users: how many users have been registered on the server, recent users, top users on the server, create/edit/remove a user.
* Journal: how many Journals and how many entries in Journal on the server, last Journal, and last entries, edit a journal (see/update/remove) entries.
* Activities: how many activities are available on the server, change activities visibility from Client, update order and way to appear in the favorite view.
* Graphic and request: display graphics and report on previous data.

To login to the Dashboard the first time, you will have to create an admin account using this command:

	sh add-admin.sh admin password http://127.0.0.1:8080/auth/signup

Where **admin** is the login for the new admin account and **password** is the password.

Once the admin account is created, you could access Sugarizer Dashboard on http://127.0.0.1:8080/dashboard.

## Server API

To implement the above functionalities, the sugarizer backend expose an API. The API routes look as follows:


#### INFORMATION ROUTE

        [GET]  /api/

#### ACTIVITIES ROUTES

        [GET]  /api/v1/activities/org.olpcfrance.Abecedarium
        [GET]  /api/v1/activities/org.olpcfrance.Abecedarium?fields=id,name,icon
        [GET]  /api/v1/activities/
        [GET]  /api/v1/activities?q=Abece
        [GET]  /api/v1/activities?favorite=true
        [GET]  /api/v1/activities?version=2
        [GET]  /api/v1/activities?name=Gears
        [GET]  /api/v1/activities?favorite=true&version=2
        [GET]  /api/v1/activities?fields=id,name,icon
        [GET]  /api/v1/activities?fields=id,name,icon&sort=-name
        [GET]  /api/v1/activities?fields=id,name,icon&favorite=true&sort=name

#### USERS ROUTES

        [POST]  /auth/login
        [POST]  /auth/signup
        [GET]   /api/v1/users
        [GET]   /api/v1/users/:uid
        [POST]  /api/v1/users
        [PUT]   /api/v1/users/:uid
        [GET]   /api/v1/adminusers
        [GET]   /api/v1/adminusers/:uid
        [POST]  /api/v1/adminusers
        [PUT]   /api/v1/adminusers/:uid
        [GET]   /api/v1/users?q=tarun&language=fr&page=3&limit=20

#### JOURNAL ROUTES

        [GET]    api/v1/journal/
        [GET]    api/v1/journal/type=shared
        [GET]    api/v1/journal/:jid
        [GET]    api/v1/journal/:jid?fields=metadata,text
        [GET]    api/v1/journal/:jid?aid=:aid
        [GET]    api/v1/journal/:jid?aid=:aid&fields=metadata,text
        [GET]    api/v1/journal/:jid?aid=:aid&fields=metadata,text&page=3&limit=20&sort=-timestamp
        [GET]    api/v1/journal/:jid?uid=:uid
        [GET]    api/v1/journal/:jid?uid=:uid&fields=metadata,text
        [GET]    api/v1/journal/:jid?uid=:uid&fields=metadata,text&page=3&limit=20
        [GET]    api/v1/journal/:jid?uid=:uid&aid=:aid&fields=metadata,text&page=3&limit=20&sort=-timestamp
        [GET]    api/v1/journal/:jid?oid=:oid
        [POST]   api/v1/journal/:jid
        [GET]    api/v1/journal/:jid?oid=:oid
        [PUT]    api/v1/journal/:jid?oid=:oid
        [DELETE] api/v1/journal/:jid?oid=:oid


#### STATS ROUTES

        [GET]    api/v1/stats?user_id=592d4445cc8be9187abb284f
        [GET]    api/v1/stats?event_object=home_view
        [GET]    api/v1/stats?user_id=592d4445cc8be9187abb284f&sort=-timestamp
        [POST]   api/v1/stats/
        [DELETE] api/v1/stats/


A full documentation of the API is available in http://127.0.0.1:8080/docs.

To generate docs, run the following command in `terminal`.

    apidoc -i api/controller  -i dashboard/helper -o docs/www/


## Running Server securely using SSL

Sugarizer Server could be run securely using SSL.
Few parameters in the **[security]** section of the setting file are dedicated to that.

* To run the server securely set `https` parameter to `true`.
* `certificate_file` and `key_file` are path to certificate and key file to sign requests.
* `strict_ssl` should be set to `false` if your certificate is a self signed certificate or is a certificate not signed by a trusted authority.


## Unit testing

Sugarizer Server includes a set of unit tests on the API.
To run unit tests for Sugarizer Server launch:

	npm test

Note that settings for unit testing are defined in [env/test.ini](env/test.ini).


## License

This project is licensed under `Apache v2` License. See [LICENSE](LICENSE) for full license text.
