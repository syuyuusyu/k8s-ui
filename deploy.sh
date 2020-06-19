v="v1.04"
npm run build &&
docker build -t k8s-ui:$v . &&
docker tag k8s-ui:$v 10.10.25.1:5000/k8s-ui:$v &&
docker push 10.10.25.1:5000/k8s-ui:$v 
#kubectl --kubeconfig=/Users/syu/.kube/config-company patch deployment cloud-ui-dep -n cloud-ns --patch '{"spec": {"template": {"spec": {"containers": [{"name": "cloud-ui","image": "192.168.50.28:5000/cloud-ui:'$v'"}]}}}}'



