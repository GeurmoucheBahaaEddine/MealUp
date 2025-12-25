---
description: Procédure complète de sauvegarde et déploiement (GitHub + Firebase)
---

# Guide de Déploiement Complet

Suivez ces étapes pour synchroniser votre code et mettre à jour votre site web.

## Étape 1 : Synchronisation GitHub
// turbo
1. Exécutez : `git add .`
2. Exécutez : `git commit -m "Refonte Admin UI terminée"`
3. Exécutez : `git push origin main`

## Étape 2 : Déploiement Frontend
1. Allez dans le dossier : `cd frontend`
2. Construisez le projet : `npm run build`
3. Déployez : `firebase deploy`

---
> Note: Le backend sur Render se mettra à jour automatiquement après le push GitHub.
