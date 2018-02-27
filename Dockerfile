FROM node:9

LABEL maintainer="Darius Cupsa <cupsadarius@gmail.com>"

RUN mkdir -p /usr/lamden/swaps

WORKDIR /usr/lamden/swaps

ENV PORT 80

COPY . /usr/lamden/swaps

RUN npm install

RUN truffle compile

RUN npm run build

CMD [ "npm", "run", "-s", "start"]
