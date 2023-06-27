#! /bin/bash

if [ -z $AWS_PROFILE ];  then
  export AWS_PROFILE=tugodfrey
fi

# if [ -z $AWS_PROFILE ];  then
#   export AWS_PROFILE=tgodfrey
# fi

aws sts get-caller-identity

# aws ec2 describe-instances --filters Name=tag-value,Values=k8s-master

MASTER_INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-master --query "Reservations[*].Instances[*].InstanceId" --output text)
WORKER1_INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-worker1 --query "Reservations[*].Instances[*].InstanceId" --output text)
WORKER2_INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-worker2 --query "Reservations[*].Instances[*].InstanceId" --output text)
echo $MASTER_INSTANCE_ID

aws ec2 stop-instances --instance-ids "$MASTER_INSTANCE_ID" "$WORKER1_INSTANCE_ID" "$WORKER2_INSTANCE_ID"
