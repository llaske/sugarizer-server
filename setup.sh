#!/bin/bash

set -e

localFolder="../sugarizer"
currentDirectory=${PWD##*/}
repository="git@github.com:llaske/sugarizer.git"

command -v git >/dev/null 2>&1 || { echo >&2 "Please install Git to continue."; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "Please install Node to continue."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Please install npm to continue."; exit 1; }

echo "Installing Sugarizer-Server npm modules..."
sudo npm install

if [ -d $localFolder ]; then 	
    echo -e "Directory $localFolder already exits, skipping...\n"
else
    echo -e "Cloning repository: $repository"
    git clone "$repository" --branch dev "$localFolder"
fi

cd $localFolder
echo "Installing Sugarizer npm modules..."
sudo npm install

cd ../"$currentDirectory"

echo -e "Creating config...\n"
read -p "Enter server name: " serverName
read -p "Enter server description: " serverDescription
read -p "Enter DB port: " dbPort
echo -e "[information]\nname = $serverName\ndescription = $serverDescription\n\n[web]\nport = 8080\n\n[security]\nmin_password_size = 4\nmax_age = 172800000\nhttps = false\ncertificate_file = ../server.crt\nkey_file = ../server.key\nstrict_ssl = false\n\n[client]\npath = ../sugarizer/\n\n[database]\nserver = 127.0.0.1\nport = $dbPort\nname = sugarizer\nwaitdb = 1\n\n[presence]\nport = 8039\n\n[statistics]\nactive = true\n\n[collections]\nusers = users\njournal = journal\nstats = stats\nclassrooms = classrooms\n\n[activities]\nactivities_directory_name = activities\ntemplate_directory_name = ActivityTemplate\nactivity_info_path = activity/activity.info\nfavorites = org.sugarlabs.GearsActivity,org.sugarlabs.MazeWebActivity,org.olpcfrance.PaintActivity,org.olpcfrance.TamTamMicro,org.olpcfrance.MemorizeActivity,org.olpg-france.physicsjs,org.sugarlabs.CalculateActivity,org.sugarlabs.TurtleBlocksJS,org.sugarlabs.Clock,org.sugarlabs.SpeakActivity,org.sugarlabs.moon,org.olpcfrance.RecordActivity,org.olpcfrance.Abecedarium,org.olpcfrance.videoviewer,org.olpcfrance.FoodChain,org.olpc-france.labyrinthjs,org.olpcfrance.TankOp,org.sugarlabs.ChatPrototype,org.olpcfrance.Gridpaint,org.olpcfrance.EbookReader,org.olpcfrance.sharednotes,org.sugarlabs.ColorMyWorldActivity,com.homegrownapps.xoeditor,com.homegrownapps.reflection,com.homegrownapps.abacus,com.homegrownapps.flip,org.somosazucar.JappyActivity,org.olpcfrance.qrcode,org.sugarlabs.Markdown,org.sugarlabs.gameOfLife,org.sugarlabs.Scratch,org.sugarlabs.FotoToonJs,org.sugarlabs.Exerciser,org.sugarlabs.SprintMath" > env/sugarizer.ini
echo -e "Config created \n"

echo "Starting Sugarizer-Server at localhost:8080"
node sugarizer.js &

sleep 10s
echo "Creating admin. Username: admin Password: password"
sh add-admin.sh admin password http://127.0.0.1:8080/auth/signup
