FROM node:7-alpine

ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
#RUN apt-get update && apt-get install -y build-essential && apt-get install -y python
#RUN apk add --no-cache --update build-base
RUN apk --no-cache add --virtual builds-deps build-base python

COPY ./package.json /usr/src/app/

RUN npm install && npm rebuild bcrypt --build-from-source
RUN apk del builds-deps

# Install app dependencies
COPY ./lib /usr/src/app/lib
COPY ./README.md /usr/src/app/
COPY ./tree-gateway.json /usr/src/app/
COPY ./rest.config /usr/src/app/
COPY ./dist /usr/src/app/dist

EXPOSE 8000 8001

VOLUME ["/usr/src/app/logs"]

CMD [ "npm", "run", "start:cluster"]
