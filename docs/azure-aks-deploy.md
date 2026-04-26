# Deploy To Azure AKS With Helm

This project is ready to deploy to Azure Kubernetes Service (AKS) with:

- `apps/web/Dockerfile`
- `apps/api/Dockerfile`
- `deploy/helm/helm-try`
- `deploy/helm/helm-try/values-azure.yaml`

## 1. Set your variables

```bash
export RESOURCE_GROUP="rg-helm-try"
export LOCATION="westeurope"
export CLUSTER_NAME="aks-helm-try"
export ACR_NAME="helmtryacr"
export NAMESPACE="helm-try"
export WEB_IMAGE="helm-try-web"
export API_IMAGE="helm-try-api"
export IMAGE_TAG="v1"
export WEB_HOST=""
export API_HOST=""
```

## 2. Create Azure resources

```bash
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Basic

az aks create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$CLUSTER_NAME" \
  --location "$LOCATION" \
  --node-count 1 \
  --enable-managed-identity \
  --enable-app-routing \
  --attach-acr "$ACR_NAME" \
  --generate-ssh-keys
```

## 3. Connect kubectl to AKS

```bash
az aks get-credentials \
  --resource-group "$RESOURCE_GROUP" \
  --name "$CLUSTER_NAME"

kubectl create namespace "$NAMESPACE"
```

## 4. Build and push images

Build locally:

```bash
docker build -f apps/web/Dockerfile -t "$ACR_NAME.azurecr.io/$WEB_IMAGE:$IMAGE_TAG" .
docker build -f apps/api/Dockerfile -t "$ACR_NAME.azurecr.io/$API_IMAGE:$IMAGE_TAG" .
```

Log in and push:

```bash
az acr login --name "$ACR_NAME"

docker push "$ACR_NAME.azurecr.io/$WEB_IMAGE:$IMAGE_TAG"
docker push "$ACR_NAME.azurecr.io/$API_IMAGE:$IMAGE_TAG"
```

If you prefer Azure to build the images instead of local Docker:

```bash
az acr build \
  --registry "$ACR_NAME" \
  --image "$WEB_IMAGE:$IMAGE_TAG" \
  --file apps/web/Dockerfile .

az acr build \
  --registry "$ACR_NAME" \
  --image "$API_IMAGE:$IMAGE_TAG" \
  --file apps/api/Dockerfile .
```

## 5. Deploy with Helm

Get the public ingress IP first:

```bash
export INGRESS_IP="$(kubectl get service -n app-routing-system nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Deploy without hostnames:

```bash
helm upgrade --install helm-try deploy/helm/helm-try \
  --namespace "$NAMESPACE" \
  -f deploy/helm/helm-try/values-azure.yaml \
  --set web.image.repository="$ACR_NAME.azurecr.io/$WEB_IMAGE" \
  --set web.image.tag="$IMAGE_TAG" \
  --set api.image.repository="$ACR_NAME.azurecr.io/$API_IMAGE" \
  --set api.image.tag="$IMAGE_TAG" \
  --set web.env.NEXT_PUBLIC_API_BASE_URL="http://$INGRESS_IP/api" \
  --set ingress.web.host="$WEB_HOST" \
  --set ingress.api.host="$API_HOST"
```

## 6. Verify the deployment

```bash
kubectl get pods -n "$NAMESPACE"
kubectl get svc -n "$NAMESPACE"
kubectl get ingress -n "$NAMESPACE"
kubectl rollout status deployment/helm-try-helm-try-web -n "$NAMESPACE"
kubectl rollout status deployment/helm-try-helm-try-api -n "$NAMESPACE"
```

Test the API:

```bash
curl "http://$INGRESS_IP/api/health"
```

## Notes

- The Helm chart creates separate Deployments, Services, and Ingress resources for `web` and `api`.
- AKS application routing uses the ingress class `webapprouting.kubernetes.azure.com`, which is already set in `values-azure.yaml`.
- AKS application routing gives you a public IP by default, not an Azure-provided public app hostname.
- Without a domain, leave `ingress.web.host` and `ingress.api.host` empty and access the app by IP.
- In that IP-based setup, the web app is served at `/` and the API is served at `/api`.
- If you later use your own DNS, point `WEB_HOST` and `API_HOST` to the ingress IP or configure Azure DNS with the AKS application routing add-on.
- The frontend reads `NEXT_PUBLIC_API_BASE_URL` at runtime, so Helm can set the API URL per environment.
