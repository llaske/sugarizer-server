
## Run Sugarizer using Docker

To run Sugarizer Server using Docker and Docker Compose:

**Clone Sugarizer Client and Sugarizer Server**

	git clone https://github.com/llaske/sugarizer
	git clone https://github.com/llaske/sugarizer-server

**Install Docker and Docker Compose on Ubuntu**

	curl -fsSL https://get.docker.com/ | sh

Install Docker Compose

	curl -L "https://github.com/docker/compose/releases/download/1.8.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
	chmod +x /usr/local/bin/docker-compose

To install Docker Compose on ARM architectures (e.g. for the Raspberry Pi 3), the link above will not work.  You need to use [arm-compose](https://github.com/hypriot/arm-compose) instead.

You can find more details about the installation of **Docker** [here](https://docker.github.io/engine/installation/)

You can	find more details about	the installation of **Docker Compose** [here](https://docs.docker.com/compose/install/)

After that, go to the Sugarizer Server folder and launch

	cd sugarizer-server
	sh generate-docker-compose.sh
	docker-compose up -d

Your Sugarizer server will start automatically and will be accessible on http://127.0.0.1:8080 and your public IP. The database will be persisted inside the folder docker/db.

## Run Sugarizer on Linux

To run Sugarizer Server **without Docker**, follow the step behind. Commands are shown from a new Debian Linux machine and could be different for other Linux distribution or for an already installed machine:


**Install Node.js**: Install Node.js (6+) and npm to manage packages. See [here](http://nodejs.org/ "here") more information.

    sudo apt-get install nodejs

**Install MongoDB**: Install MongoDB (2.6+). Don't forget to create a /data/db directory to store databases. See [here](http://www.mongodb.org/ "here") more information.

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

*Warning:* If your server had an unclean shutdown on previous boot, MongoDB could not start correctly telling that some files are locked. In that case, launch first:

	sudo mongod --repair


## Run Sugarizer on MacOS

**Install Xcode Command-Line Tools:** Install the Xcode command-line tools by running the following command in your macOS Terminal.   

        xcode-select --install
  
**Install homebrew:** Run this command on terminal.

        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

*To check the version type the following command.*

        brew -v

**Installing NodeJS:** In the terminal type the following command to install Node.
  
        brew install node

*If everything installed successfully then you can type in the following command in the terminal to check the Node and NPM version.*

        node -v
        npm -v

  
**Install and Run MongoDB with Homebrew**

*Tap the MongoDB Homebrew Tap to download the official Homebrew formula for MongoDB and the Database Tools, by running the following command in your macOS Terminal.*

        brew tap mongodb/brew

*To install MongoDB, run the following command in your macOS Terminal application.*

        brew install mongodb-community@6.0

*After downloading Mongo, data directory is where the Mongo data files will live. You can visit the default directory using the below commands in your terminal.*

- Apple M1 processors 

        /opt/homebrew/var/mongodb  

- Intel processors

        /usr/local/var/mongodb 

If incase you want to check where does the data directory lives in finder, you can take the help from this [link](https://macpaw.com/how-to/access-opt-folder-on-mac#:~:text=Whatever%20the%20format%20you%20find,one%20in%20its%20own%20subdirectory.%E2%80%9D
).

*To **run** MongoDB (i.e. the  mongod) **manually as a background process**, run:*

- For macOS running Intel processors:  

        mongod --config /usr/local/etc/mongod.conf --fork

- For macOS running on Apple M1 processors:

        mongod --config /opt/homebrew/etc/mongod.conf --fork
  
*To **stop** the MongoDB  process running in background, run:*

        mongosh
        use admin
        db.shutdownServer()


**Install Sugarizer Client and Server**

        brew install git
        cd desktop
        git clone https://github.com/llaske/sugarizer
        git clone https://github.com/llaske/sugarizer-server
        cd sugarizer-server
        npm install

**Run MongoDB and Sugarizer Server**:Run mongod and Sugarizer.

        mongod
        node sugarizer.js


## Run Sugarizer on a RaspberryPI

To deploy Sugarizer Server on a Raspberry Pi, you could use instructions above to deploy on Linux or to deploy on Docker.

A specific packaging name [Sugarizer Schoolbox](https://github.com/llaske/sugarizer-school-box) is also available [here](https://github.com/llaske/sugarizer-school-box) but is currently **deprecated**.


## Run Sugarizer on the cloud

You could install on any existing cloud platform (Amazon, Microsoft Azure, Google Cloud Platform, ...). Detail of settings for:

* **Google Cloud Platform** is available [here](deploytoGCP.md),
* **Amazon Web Services** is available [here](deploytoAWS.md).



## Check your install

To check your Sugarizer Server install, run "http://127.0.0.1:8080" in your browser:

* once a new user created, you should see the home with all activities,
* go to Journal view, you should see at the bottom of the screen the two icons to switch to private/shared journal,
* go to the neighborhood view, you should see one icon for the server and one for you.

