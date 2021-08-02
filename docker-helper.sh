#! /bin/bash

IMAGE_NAME_BE="tutug/task-marker-be"
CONTAINER_NAME_BE=task-marker-container-be
PORT_BE=3005
API_URL="http://localhost:$PORT_BE/api"

function docker_deploy_help() {
  echo """
    Get help by providing the flags "-h" or "--help"

    To build and run images run the following functions
    build_image_be: accepts 3 arguments ARG 1 jwt_secret (required), 
    ARG 2 portnumber to expose, ARG 3 imagename (optional). 

    run_container_be: Accept 2 optional arguments to override the defaults ARG 1 container name 
    ARG 2  PORT number that the container will map to.

    delete_image: delete the image

    delete_container: delete the container. You can also specify -f to delete container if it is running.

    push_image: push docker image to repository
   """
}

if [[ $1 == "-h" ]] || [[ $1 == "--help" ]]; then
  echo "Hello arg $1"
  docker_deploy_help
  return 0;
fi

function build_image_be() {
  if [ -z "$1" ]; then
    echo "Please provide JWT_SECRET key"
    return 1
  fi

  JWT_SECRET=$1
  if [[ $# == 2 ]]; then 
    PORT_BE=$1
  fi

  if [[ $# == 3 ]]; then 
    PORT_BE=$1
    IMAGE_NAME_BE=$3
  fi

  command="docker build --build-arg JWT_SECRET=$JWT_SECRET --build-arg port=$PORT_BE -t $IMAGE_NAME_BE:latest .";
  echo Executing $command;
  $command;
}

function run_container_be() {
  PORT_MAP=$PORT_BE
  if [[ $# == 1 ]]; then
    CONTAINER_NAME_BE=$1
  fi

  if [[ $# == 2 ]]; then
    CONTAINER_NAME_BE=$1
    PORT_MAP=$1
  fi
  command="docker run -d --name $CONTAINER_NAME_BE -p $PORT_MAP:$PORT_BE  $IMAGE_NAME_BE";
  echo Executing: $command;
  $command
}

# if [ -z "$1" ]; then
#   # PORT=$(kubectl get service $SERVICE --output='jsonpath="{.spec.ports[0].nodePort}"')
#   return "Please provide the url for API requests";
# fi

function push_image_be() {
  command="docker push $IMAGE_NAME_BE:latest";
  echo Executing: $command;
  $command
}

function delete_image_be() {
  command="docker rmi $IMAGE_NAME_BE";
  echo Executing: $command;
  $command
}

function delete_container_be() {
  # Provide the -f flag to stop and delete container
  if [[ $1 == '-f' ]]; then
    command="docker container stop $CONTAINER_NAME_BE";
    echo Executing: $command;
    $command

    command="docker container rm $CONTAINER_NAME_BE";
    echo Executing: $command;
    $command
  else
    command="docker container rm $CONTAINER_NAME_BE";
    echo Executing: $command;
    $command
  fi
}
  
echo Get help by providing the flags "-h" or "--help"

## Other useful commands
#docker save tutug/task-marker-fe -o frontend-image
#docker save tutug/task-marker-fe -o frontend-image
#docker load -i frontend-image
#docker load -i frontend-image
