FROM node:8-alpine

ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./package.json /usr/src/app/
COPY ./npm-shrinkwrap.json /usr/src/app/

RUN npm install

# Install app
COPY README.md tree-gateway.json rest.config ioc.config /usr/src/app/
COPY ./lib /usr/src/app/lib/
COPY ./dist /usr/src/app/dist/

EXPOSE 8000 8001

VOLUME ["/usr/src/app/logs"]

CMD ["npm", "run", "start:cluster"]
