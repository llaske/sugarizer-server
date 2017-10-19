FROM mikkl/multiarch-node:{ARCH}
WORKDIR /sugarizer-server/
CMD npm install; NODE_ENV=docker nodejs /sugarizer-server/sugarizer.js /sugarizer-server/env/docker.ini
