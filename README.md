# in-vino-veritas

[![CI](https://github.com/fr4nckr/in-vino-veritas/actions/workflows/workflow.yml/badge.svg)](https://github.com/fr4nckr/in-vino-veritas/actions/workflows/workflow.yml)


## Principe du projet InVinoVeritas et de ce MVP

In Vino Veritas est un projet de tokenisation de foncier viticole/agricole. Il permet à des investisseurs d'entrer dans un cercle vertueux, finançant des projets fonciers qui seront loués à des jeunes exploitants n'ayant pas les moyens financiers d'être propriétaire.

Ce MVP se concentre sur la première étape du projet qui consiste à mettre en vente du foncier pour permettre à des investisseurs autorisés d'acheter des droits (tokens) sur la structure juridique détenant ce foncier.

1. Un domaine viticole est sélectionné/achété et sa valeur est estimée (off-chain)
2. Lorsque les structures juridiques et administratives adéquates ont été crées, le projet est créé dans la dApp et à ce moment-là, deux contrats sont déployés via l'utilisation du pattern Factory : 
    2.1 Un contrat representant le projet foncier. Il permet  de gérer le déroulement de la vente du projet avec une whitelist d'investisseurs et la distribution des tokens conformément aux paramètres du projet. 
    2.2 Un token ERC20 associé au projet est déployé au même moment. La supply totale du token est calculée selon la valeur du projet foncier avec un taux de change fixé à 50$ par token. Il s'agit de la supply maximale pouvant être atteinte. Ici l'extension ERC20Capped a été utilisée pour garantir ce principe.
3. Les investisseurs peuvent demander à participer au projet, ce qui est soumis à approbation. Etant proche de la notion de security token et dans ce MVP, j'ai choisi d'implémenter une whitelist dans le contrat et un workflow de validation afin de représenter ce mécanisme. 
4. L'administrateur valide ou refuse la demande de participation de l'investisseur et peut démarrer à tout moment la vente du projet (avec ou sans investisseurs renseignés). 
5  Les investisseurs autorisés peuvent acheter une partie de la supply disponible du token associé au projet en payant en USDC. 
5. Lorsque l'administrateur le souhaite, il peut clôturer la vente.  
6. L'administrateur peut ensuite collecter les fonds sur un autre wallet (treasury) afin de préparer la suite du projet qui doit se porter vers l'écosystème DeFi (hors MVP).

#Schéma du MVP 


#Backend 

Tests realisés 
//

##Technologies utilisées : 
    - Hardhat 


#FrontEnd
##TBD

#Intégration continue : 

##TBD