# k8s-ui

```
docker run -d -p 8002:8002 -v {PATH OF YOUR KUBE COFNF eg ~/.kube/config}:/config --name k8s-svc --restart=always syuyuusyu/k8s-svc:latest
```

```
docker run -d -p 3002:3000  --name k8s-ui --restart=always syuyuusyu/k8s-ui:latest
```
