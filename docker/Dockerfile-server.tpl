FROM mikkl/multiarch-node:{ARCH}
WORKDIR /sugarizer-repo/server
CMD npm install; NODE_ENV=docker nodejs /sugarizer-repo/server/sugarizer.js
