# Migration guide

This documentation describes migration process to a recent Sugarizer Server version.

## Migrate to 1.5.0
Two new collections need to be added to the `[collections]` section of your `.ini` file:

```
assignments = assignments
activities = activities
```

Sugarizer Server version 1.5.0 require MongoDB 3.2+.
Recent versions of MongoDB don't support old database file format so we recommend to dump your current database before upgrading to avoid losing data.

Depending from the way you're running Sugarizer Server, follow the migration guide below.

See [MongoDB documentation](https://www.mongodb.com/docs/database-tools/) for more information.

### Running Sugarizer Server on your computer

If Sugarizer Server and MongoDB run from your computer.

First stop Sugarizer Server, then launch dump command.

```
mongodump --db=sugarizer 
```

A `dump/sugarizer` directory has been created on the `db` directory.

Now stop MongoDB and upgrade it to a recent version. Then launch the new MongoDB engine.

Finally, launch the restore command.

```
mongorestore --db=sugarizer dump/sugarizer
```


### Running Sugarizer Server using Docker

First identify the id for the MongoDB container by running.

```
docker ps
```

The id is the one on the line named `sugarizer-server_mongodb`.

Now attach a bash shell on the running MongoDB instance by running:

```
docker exec -it <IdOfDockerForMongoDB> /bin/bash
```

Then launch the dump command.
:

```
cd /data/db 
mongodump --db=sugarizer 
```

You could exit from the bash shell.
A new directory `dump` has been created in `sugarizer-server/docker/db`.

You must now delete the container and the old MongoDB image. Type following commands:

```
docker rm <IdOfDockerForMongoDB>
docker rmi sugarizer-server_mongodb:latest
```

You could now upgrade Sugarizer Server, probably just by doing a `git pull`.

Once Sugarizer Server is upgraded, regenerate the docker file by a call to:

```
sh generate-docker-compose.sh
```

Then run new containers:

```
docker-compose up -d
```

It could take some time and a message telling than mongodb is building should appears.

Follow the same process than before to attach a bash shell on the new running Mongodb instance:

```
docker ps
docker exec -it <IdOfDockerForNewMongoDB> /bin/bash
```

Finally launch the restore command:

```
cd /data/db 
mongorestore --db=sugarizer dump/sugarizer 
```

