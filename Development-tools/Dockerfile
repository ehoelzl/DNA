FROM mhart/alpine-node:base
WORKDIR /dna_development
ADD . /dna_development
RUN apk update && apk add alpine-sdk && apk add git && apk add python &&  apk add nodejs && npm install -g ethereumjs-testrpc
EXPOSE 8545
RUN testrpc

