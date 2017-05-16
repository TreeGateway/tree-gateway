FROM node:6.9.5

ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./tree-gateway.json /usr/src/app/
COPY ./rest.config /usr/src/app/
COPY ./package.json /usr/src/app/
COPY ./dist /usr/src/app/dist
COPY ./README.md /usr/src/app/

# Install dependencies
RUN npm install

EXPOSE 8000 8001

VOLUME ["/usr/src/app/logs"]

CMD [ "npm", "start"]
