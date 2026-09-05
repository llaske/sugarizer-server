FROM --platform=linux/{ARCH} node:20-bookworm
WORKDIR /sugarizer-server/
CMD npm install; NODE_ENV=docker node /sugarizer-server/sugarizer.js /sugarizer-server/env/docker.ini
