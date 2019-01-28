FROM llaske/multiarch-node6:{ARCH}
WORKDIR /sugarizer-server/
CMD npm install; NODE_ENV=docker node /sugarizer-server/sugarizer.js /sugarizer-server/env/docker.ini
