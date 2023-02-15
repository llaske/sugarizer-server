ARCH=`uname -m`

case "$ARCH" in
    "x86_64") TAG="amd64"
	;;
    "armv6l") TAG="armv6l"
    echo "Platform no longer supported"
    exit 1
	;;
    "i386") TAG="i386"
    echo "Platform no longer supported"
    exit 1
	;;
    "i686") TAG="i386"
    echo "Platform no longer supported"
    exit 1
	;;
    "armv7l") TAG="armhf"
    echo "Platform no longer supported"
    exit 1
	;;
    "aarch64") TAG="arm64"
	;;
esac

sed  "s/{ARCH}/$TAG/g" docker/Dockerfile-mongodb.tpl > docker/Dockerfile-mongodb
sed  "s/{ARCH}/$TAG/g" docker/Dockerfile-server.tpl > docker/Dockerfile-server

cp sugarizer-compose.yml docker-compose.yml
