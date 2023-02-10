# Secure Vault Project

## Table of Contents
- [Secure Vault Project](#secure-vault-project)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Design](#design)
    - [Key Derivation Protocol](#key-derivation-protocol)
  - [Glossary](#glossary)

## Introduction

The aim of this project has been to create a library that can be installed and used on the client side of a web-application in order to apply PBKDF over passwords and encrypt/decrypt data in a transparent way for the client. In order to do this, a more powerful KDF has been used (scrypt) on the client side. To achieve this, a series of points have been developed to demonstrate the functionalities of the library in a realistic environment.

- Development of a library that acts as a black box where the client has specific functions that it can call. These are the ones that execute all the necessary steps to apply the PBDFK on passwords, communicate with the server and encrypt/decrypt data on the client side.
- Develop a web application, in which the library is used and can be seen to work correctly. This application has also to simulate a secure vault where the user can upload encrypted data and see the content decrypted on the browser.
- Implementation of the backend server, which contains all the necessary endpoints to persist data, return information requested by the client or store data in the Google Cloud Storage. All this together with different PassportJS strategies with the configuration for authentication or authorization requests.
- Add Server Sent Events (SSE) in order to update with the uploaded content in the server on all devices to keep them in sync with each other.

In this repository we are going to explain the general information related to the project but the specific one related to the library will be seen in the  library repo.

## Design
For the design of the project, as we wanted to show a real use case there is a client, a server, a database and a cloud storage. The client needs to be able to upload encrypted data to the cloud. The important thing is that the content stored on the cloud can only be decrypted on the client side. In addition, the client can also generate derived keys so that neither the server nor the cloud storage provider can know the original password. On the other side, the server simply has to handle all the endpoints and execute the necessary actions expected by the client. The server also needs to update the client content on all connected devices each time data is updated on the cloud.

### Key Derivation Protocol
It is wanted the server to be blind in relation to the information being stored (documents or passwords), some parts of the key derivation and all data encryption must be defined on the client. In the following figure we can see the protocol followed to generate the derived keys.

<p align="center">
    <img src="docummentation/out/basiKdfFlow/basicFlow.png">
    <p align = "center"><b>Fig 1. Password key derivation login protocol</b></p>
</p>

In order to guarantee an authentication and encryption flow with different keys, so that the passwords are not the same, this project has made use of two types of KDF depending if it is for the client or the server. Assuming that a user enters a password to be registered and sends it to the client to manage it, the client must apply a KDF on it. As mentioned before, it is necessary to separate them into different keys depending on the use they are going to be given, authentication or encryption. This is why a client-defined prefix is added to the passwords. The content of Figure 1 shows the authentication steps with the server.

The protocol followed [Fig 1] for key generation starts with the introduction of a password. The next step is to apply on the client side a KDF on the password concatenated with a predefined prefix to generate the authentication key. Once this is done, the derived key is sent to the server. The server has to apply another less expensive KDF on that key and compare if what it has in the database for that user matches with what has been generated from this process. After verifying that the password introduced is correct, it generates the encryption key following the same procedure as for the authentication key. The difference is that a different prefix is concatenated to the password and that only one KDF is applied to the encryption key. This is why the server is blind, because the passwords and data stored are unknown for him all the time.

## Glossary
- Password-based key derivation functions (PBKDF)
- Server Sent Event (SSE)
- Pseudorandom functions (PRF)
- Key Derivation Function (KDF)
- Json Web Token (JWT)
- Google Storage (GS)
