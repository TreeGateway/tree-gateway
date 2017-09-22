#!/bin/bash

docker login -u $DOCKER_USER -p $DOCKER_PASS
REPO=treegateway/tree-gateway
TAG=$TRAVIS_BRANCH
docker build -f Dockerfile -t $REPO:$TAG .
docker tag $REPO:$TAG $REPO:latest
docker push $REPO