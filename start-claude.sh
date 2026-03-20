#!/bin/bash
# Lance Claude Code sur le projet RÉCUPÉO
cd /var/www/recupeo
export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
echo ""
echo "=========================================="
echo "  RÉCUPÉO — Claude Code"
echo "=========================================="
echo ""
echo "Claude Code lit le CLAUDE.md automatiquement."
echo "Dis-lui ce que tu veux faire :"
echo "  - 'Continue MAPAIE — crée calculations.ts'"
echo "  - 'Lis les composants mabanque et fais Upload.tsx pour mapaie'"
echo "  - 'Lance le build et corrige les erreurs'"
echo "  - '/compact' si le contexte se remplit"
echo ""
claude
