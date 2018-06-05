FROM mhart/alpine-node:base
WORKDIR /Node_server
ADD . /Node_server
EXPOSE 3000
RUN apk update && apk add alpine-sdk && apk add git && apk add python &&  apk add nodejs && npm install
CMD ["node", "Node-server.js"]


