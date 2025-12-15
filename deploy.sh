v="https"
#ip="10.10.50.199:5000"
ip="docker.io/syuyuusyu"
name="k8s-ui"
npm run build &&
docker buildx build --platform linux/amd64 --load -t $ip/$name:$v -f Dockerfile . &&
docker push $ip/$name:$v 
#kubectl --kubeconfig=/Users/syu/.kube/config-company patch deployment cloud-ui-dep -n cloud-ns --patch '{"spec": {"template": {"spec": {"containers": [{"name": "cloud-ui","image": "192.168.50.28:5000/cloud-ui:'$v'"}]}}}}'



