FROM node:6.9.5

ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app/

# Compile application
RUN npm --production=false install \
    && npm run-script compile \
    && npm prune --production

EXPOSE 8000
CMD [ "npm", "start" ]
