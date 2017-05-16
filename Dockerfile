FROM node:6.9.5

ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./tree-gateway.json /usr/src/app/
COPY ./README.md /usr/src/app/

# Install dependencies
RUN npm install -g tree-gateway

EXPOSE 8000 8001

VOLUME ["/usr/src/app/logs"]

CMD [ "treeGateway"]
