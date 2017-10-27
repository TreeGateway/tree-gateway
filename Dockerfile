FROM node:7-alpine

ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
RUN apk --no-cache add --virtual builds-deps build-base python && \
    npm install pm2 -g

# Install app dependencies
COPY ./package.json /usr/src/app/

RUN npm install && npm rebuild bcrypt --build-from-source && \
    apk --no-cache del builds-deps build-base python

# Install app
COPY README.md tree-gateway.json rest.config /usr/src/app/
COPY ./lib /usr/src/app/lib/
COPY ./dist /usr/src/app/dist/

EXPOSE 8000 8001

VOLUME ["/usr/src/app/logs"]

CMD ["pm2-docker", "./dist/index.js", "-i", "0"]
