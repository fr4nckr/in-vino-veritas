# in-vino-veritas

[![CI](https://github.com/fr4nckr/in-vino-veritas/actions/workflows/workflow.yml/badge.svg)](https://github.com/fr4nckr/in-vino-veritas/actions/workflows/workflow.yml)

# Promotion Galilée - Projet de certification - Franck Rouanet


## Présentation du projet InVinoVeritas et du MVP réalisé

In Vino Veritas est un projet de tokenisation de foncier viticole/agricole. Il permet à des investisseurs d'entrer dans un cercle vertueux, finançant des projets fonciers qui seront loués à des jeunes exploitants n'ayant pas les moyens financiers d'être propriétaire.

![image](https://github.com/user-attachments/assets/ee339f52-dc88-451e-807e-716c91f8e9e8)



Ce MVP se concentre sur la première étape du projet qui consiste à mettre en vente du foncier pour permettre à des investisseurs autorisés d'acheter des droits (tokens) sur la structure juridique détenant ce foncier.

1. Un domaine viticole est sélectionné/acheté et sa valeur est estimée (off-chain).
2. Lorsque les structures juridiques et administratives adéquates ont été créées, le projet est lancé et peut être créé dans la Dapp grâce au contrat *InVinoVeritasProjectFactory* déployé initialement. Cette Factory permet de déployer à la volée : 
    - Un contrat *InVinoVeritasProject* représentant le projet foncier. Il permet de gérer le déroulement de la vente du projet avec une whitelist d'investisseurs et la distribution des tokens conformément aux paramètres du projet. 
    - Un token *IVV* de type ERC20 associé au projet au moment du déploiement. La supply totale du token est calculée selon la valeur du projet foncier avec un taux de change fixé à 50$ par token. Il s'agit de la supply maximale pouvant être atteinte. Ici l'extension ERC20Capped a été utilisée pour garantir ce principe.
3. Les investisseurs peuvent ensuite demander à participer au projet, ce qui est soumis à approbation. Étant proche de la notion de security token et dans ce MVP, j'ai choisi d'implémenter une whitelist dans le contrat et un workflow de validation afin de représenter ce mécanisme sans aller jusqu'à un réel process de KYC. 
4. L'administrateur valide ou refuse la demande de participation de l'investisseur et peut démarrer à tout moment la vente du projet (avec ou sans investisseurs renseignés à ce stade). 
5  Les investisseurs autorisés peuvent acheter une partie de la supply disponible du token associé au projet et peuvent payer en USDC. 
6. Lorsque l'administrateur le souhaite (au sold ou avant), il peut clôturer la vente. 
7. L'administrateur peut ensuite collecter les fonds sur un autre wallet afin de préparer la suite du projet qui doit se porter vers l'écosystème DeFi (hors MVP).
8. L'idée du projet dans son ensemble est ensuite de faire collatéraliser nos tokens IVV_XXX par du Stable Coin, de mettre en place des mécanismes d'incitations sur des LP.

## Schéma du MVP 

![image](https://github.com/user-attachments/assets/d3dc80ef-bf74-4f73-af2c-5a0a057c291f)


## Développement des smart contracts avec Hardhat 

### Technologies & librairies utilisées : 
    - Hardhat, compilateur en version 0.8.28
    - Interface ou librairies Openzeppelin utilisées : Ownable, ERC20, ERC20Capped, Math, SafeERC20
    - Scripts de déploiement réalisés en Ethers.js 
    
### Tests réalisés en javascript via Ethers.js

Chaque contrat, y compris le contrat de MockERC20 me permettant de maitriser la dépendance avec le stablecoin sur le testnet, a été testé. 
Les cas limites ont été également testés (vérification d'ownership, revert possibles) ainsi que l'émission d'évenements lorsque c'est nécessaire.

![image](https://github.com/user-attachments/assets/c1c140e8-d276-4218-989b-300887a9ff1a)

## FrontEnd
### Technologies utilisées 

- NextJS a été utilisé pour la création de l'application
- Tailwind et Shadcn ont été utilisée pour le style de l'application
- Wagmi/View et RainbowKit ont été utilisés pour les intéractions web3 (connexions wallet, réalisation des transactions, lecture d'évènements via un publicClient configuré à cet effet, hook useReadContract/useWriteContract). 

### Quelques captures d'écrans : 

#### Page d'accueil 
La page d'accueil est simple et présente rapidement le but du projet. Une barre de navigation est disponible pour changer de page et consulter le solde en USDC du compte connecté à l'application. 

![image](https://github.com/user-attachments/assets/c2e9277f-d1b0-4158-8d83-f229ad4799ad)

#### Page des projets (vue investisseur)
Cette page présente pour un investisseur la liste des projets à venir, en cours ou sold out. 
Elle permet de s'enregistrer, de consulter son statut, d'acheter des tokens d'un projet. 
![image](https://github.com/user-attachments/assets/f365cf94-9f56-489e-b0f8-fbe5372bc660)

#### Page des projets (vue administrateur)
Cette page présente pour l'administrateur de l'application la liste des projets et quelques actions relatives au projet comme démarrer la vente, clôturer la vente et collecter les fonds une fois que la vente est terminée. 
![image](https://github.com/user-attachments/assets/bf714ee1-2d67-4dae-b417-4ee26ad0e72d)

#### Page d'administration
Cette page est dédiée à l'administrateur de l'application et permet de créer un nouveau projet et de gérer l'approbation ou le refus d'investisseur pour chacun des projets 

![image](https://github.com/user-attachments/assets/65abf510-a9c5-47c1-8739-3940fb009e2a)

## Intégration continue

Le travail a été réalisé en simulant un réel travail d'équipe sur GitHub. J'ai utilisé des branches et des Pull Request pour faire évoluer mon travail de façon itérative. 

Des Github Actions ont été mises en places avec deux workflow pour valider au fur et à mesure : 
- build-backend : chargé de lancer les commandes de compilation, test, coverage et utilisation de l'outil slithers pour les alertes potentielles de sécurité. 
- build-frontend : chargé de build l'application NextJS

## Déploiement : 

L'application est disponible ici https://in-vino-veritas-iota.vercel.app
Deux contrats ont été déployés sur le testnet Sepolia aux adresses suivantes : 
- InVinoVeritasProjectFactory : [0xc0A7B765EFec3518A97dAEED68517057aA252a32](https://sepolia.etherscan.io/address/0xc0a7b765efec3518a97daeed68517057aa252a32)
- MockERC20 (USDC fictif sur le testnet) : [0x44740962A361DffC95526CEC38b18b0f599b6803](https://sepolia.etherscan.io/address/0x44740962A361DffC95526CEC38b18b0f599b6803)

L'application est ensuite automatiquement déployée sur Vercel et est disponible ici : . Elle est reliée au testnet Sepolia et aux contrats du projet précédemment déployés. 


Merci pour votre lecture 
