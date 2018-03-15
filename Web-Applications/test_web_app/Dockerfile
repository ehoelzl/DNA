FROM mhart/alpine-node:base
VOLUME .
WORKDIR /web_app
ADD . /web_app
RUN apk update && apk add alpine-sdk && apk add git && apk add python &&  apk add nodejs && npm install


