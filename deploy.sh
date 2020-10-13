v="v1.28"
#ip="10.10.50.199:5000"
ip="192.168.50.28:5000"
npm run build &&
docker build -t k8s-ui:$v . &&
docker tag k8s-ui:$v $ip/k8s-ui:$v &&
docker push $ip/k8s-ui:$v 
#kubectl --kubeconfig=/Users/syu/.kube/config-company patch deployment cloud-ui-dep -n cloud-ns --patch '{"spec": {"template": {"spec": {"containers": [{"name": "cloud-ui","image": "192.168.50.28:5000/cloud-ui:'$v'"}]}}}}'



