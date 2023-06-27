#! /bin/bash

if [ -z $AWS_PROFILE ];  then
  export AWS_PROFILE=tugodfrey
fi

# aws ec2 describe-instances --filters Name=tag-value,Values=k8s-master
# aws ec2 describe-instances --filters Name=tag:Name,Values=k8s-master

MASTER_INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-master --query "Reservations[*].Instances[*].InstanceId" --output text)
WORKER1_INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-worker1 --query "Reservations[*].Instances[*].InstanceId" --output text)
WORKER2_INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-worker2 --query "Reservations[*].Instances[*].InstanceId" --output text)
echo $MASTER_INSTANCE_ID

aws ec2 start-instances --instance-ids "$MASTER_INSTANCE_ID" "$WORKER1_INSTANCE_ID" "$WORKER2_INSTANCE_ID"

echo SLEEPING
sleep 15
echo DONE SLEEPING

MASTER_INSTANCE_IP=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-master --query "Reservations[*].Instances[*].PublicIpAddress" --output text)
WORKER1_INSTANCE_IP=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-worker1 --query "Reservations[*].Instances[*].PublicIpAddress" --output text)
WORKER2_INSTANCE_IP=$(aws ec2 describe-instances --filters Name=tag-value,Values=k8s-worker2 --query "Reservations[*].Instances[*].PublicIpAddress" --output text)
echo MASTER_INSTANCE_IP =  $MASTER_INSTANCE_IP
echo WORKER1_INSTANCE_IP = $WORKER1_INSTANCE_IP
echo WORKER2_INSTANCE_IP = $WORKER2_INSTANCE_IP
