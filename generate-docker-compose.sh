ARCH=`uname -m`

case "$ARCH" in
    "amd64"|"x86_64") TAG="amd64"
	;;
    "arm64"|"aarch64") TAG="arm64"
	;;
    "armv7l"|"armv7") TAG="arm/v7"
	;;
    "armv6l") TAG="arm/v6"
	;;
    "i386"|"i686") TAG="386"
	;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
	;;
esac

sed "s/{ARCH}/$TAG/g" sugarizer-compose.yml > docker-compose.yml
