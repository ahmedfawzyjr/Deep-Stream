# Security Architecture & Identity Management

This document outlines DeepKick's DevSecOps architecture, including user authentication, secret management, and internal mesh networks.

## 1. Authentication (OAuth2 & OIDC via Keycloak)
- All client authentication is mediated by **Keycloak** acting as our OpenID Connect (OIDC) identity provider.
- **OAuth2 Flow**: SPA/Web dashboards use the Authorization Code Flow with PKCE (Proof Key for Code Exchange) to authenticate users.
- **JWT Rotation**: Access tokens expire in 15 minutes. Refresh tokens are rotating, requesting a new session ID at each refresh call to prevent replay attacks.

## 2. Authorization (RBAC)
- Role-Based Access Control (RBAC) is enforced at the Gateway and API layer:
  - `admin`: Full access to ML retraining pipelines and Kafka broker parameters.
  - `premium-user`: High rate-limit boundaries for real-time predictions and unlimited WebSockets.
  - `anonymous`: Free trial tier, restricted by IP rate limiting to 10 requests/min.

## 3. Secret Management (HashiCorp Vault)
- No plain-text passwords or JWT certificates are allowed in git or environment variables.
- GKE Pods authenticate to **HashiCorp Vault** using GKE's native ServiceAccount credentials via Kubernetes Auth Method.
- Vault dynamically generates short-lived Database credentials and rotates JWT signing keys every 24 hours.

## 4. Network Security (Istio strict mTLS)
- Service-to-service communication within the GKE cluster is fully encrypted using **mTLS (Mutual TLS)**.
- Istio Citadel acts as the local Certificate Authority, handling automatic certificate rotation and validation for all cluster nodes.
