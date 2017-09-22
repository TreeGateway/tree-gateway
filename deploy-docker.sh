docker login -u $DOCKER_USER -p $DOCKER_PASS
export REPO=treegateway/tree-gateway
export TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo "master"; else echo $TRAVIS_BRANCH ; fi`
docker build -f Dockerfile -t $REPO:$TAG .
docker tag $REPO:$TAG $REPO:latest
docker push $REPO