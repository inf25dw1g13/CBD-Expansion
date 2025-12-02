## Food Delivery *API*

Repositório usado para hospedar um projeto desenvolvido para Desenvolvimento Web I e Complementos de Base de Dados, no curso de Informática, na Univerdade da Maia.  
Desenvolvido pelo grupo 13 - inf25dw1g13
* [Felipe Castilho](https://github.com/a047152)
* [Juliana Moreira](https://github.com/julianaam13) 
* [Marta Vieira](http://github.com/xmarta19)

## Descrição 

Este trabalho tem como objetivo desenvolver uma *API REST* que simula o funcionamento de uma plataforma de entregas de comida. A *API* implementa operações *CRUD* (*Create*, *Read*, *Update*, *Delete*) através dos métodos *HTTP POST*, *GET*, *PUT* e *DELETE*, permitindo a gestão completa dos recursos do sistema.

O projeto foi desenvolvido seguindo uma abordagem ***Design-first***, onde a *API* foi primeiro especificada através do formato *OpenAPI* 3.0 antes da implementação do código. Esta abordagem permite uma melhor definição dos contratos da *API*, facilita a comunicação entre *frontend* e *backend*, e garante a validação automática de requisições e respostas.

A *API* interage com uma base de dados *MariaDB* para estrutura e armazenamento de dados relacionados às entregas. O sistema inclui as seguintes entidades principais:
- **Restaurantes**: Gestão de restaurantes parceiros
- **Pratos**: Catálogo de pratos disponíveis
- **Clientes**: Gestão de clientes do sistema
- **Pedidos**: Processamento e gestão de pedidos
- **Ingredientes**: Catálogo de ingredientes utilizados
- **Entregas**: Rastreamento de entregas    

Links úteis:
* **Organização *GitHub*:** [inf25dw1g13](https://github.com/inf25dw1g13)  
* **Repositório do *DockerHub*:** [inf25dw1g13](https://hub.docker.com/u/inf25dw1g13)

### Arquitetura de Replicação

O sistema implementa uma arquitetura de replicação de base de dados utilizando:
- ***MariaDB Master***: Servidor principal responsável por todas as operações de escrita (*INSERT*, *UPDATE*, *DELETE*)
- ***MariaDB Replicas***: Dois servidores secundários configurados como réplicas, utilizados exclusivamente para operações de leitura (*SELECT*)
- ***MaxScale***: *Middleware* que implementa *read/write splitting*, encaminhando automaticamente:
  - Operações de escrita (*POST*, *PUT*, *DELETE*) → *Master*
  - Operações de leitura (*GET*) → Réplicas (distribuindo a carga)
    
## Organização do Projeto

* **Código *Source*** está em [src](src/).
* **Capítulos do Trabalho** estão em [doc](doc/).
* **O Documento da *API*** está em [src/express-server/api/openapi.yaml](src/express-server/api/openapi.yaml)
* ***Postman Collection*** está em [src/postman_collection.json](src/postman_collection.json)


## Galeria

| Descrição            | Imagem |
|----------------------|--------|
| *DockerHub*: *Containers* | <img src="doc/images/containers-docker.png" alt="DockerHub: Containers" width="570"/> |
| *DockerHub*: *Images*     | <img src="doc/images/imagens-docker.png" alt="DockerHub: Images" width="570"/> |
| *Swagger UI*            | <img src="doc/images/api-docs-print.png" alt="Swagger UI" width="570"/> |
| *Swagger UI*: Exemplo   | <img src="doc/images/api-docs-metodo.png" alt="Swagger UI: Exemplo" width="570"/> |
| *Postman*: Recursos     | <img src="doc/images/postman_recursos.png" alt="Postman: Recursos" width="570"/> |
| *Postman*: Método *GET*   | <img src="doc/images/postman_metodo_get.png" alt="Postman: Método GET" width="570"/> |

## Tecnologias

### Linguagens e Formatos

* [*JavaScript*](https://developer.mozilla.org/en-US/docs/Learn/JavaScript) - Linguagem de programação utilizada
* [*JSON*](https://www.json.org/) - Formato de dados para comunicação entre cliente e servidor
* [*YAML*](https://yaml.org/) - Formato utilizado para especificação *OpenAPI*

### Base de Dados

* [*MariaDB*](https://mariadb.org/) (v11.2) - Sistema de gestão de base de dados relacional
* [*MaxScale*](https://mariadb.com/products/mariadb-platform/mariadb-maxscale/) (v23.08) - *Proxy* de base de dados para *read/write splitting* e replicação

### Runtime e Servidor

* [*Node.js*](https://nodejs.org/) (v20) - *Runtime JavaScript* no servidor
* [*Express.js*](https://expressjs.com/) (v4.18.2) - *Framework* web para *Node.js*

### Containerização

* [*Docker*](https://www.docker.com/) - Plataforma de containerização
* [*Docker Compose*](https://docs.docker.com/compose/) - Orquestração de *containers multi-container*

### Documentação e Validação

* [*OpenAPI* 3.0](https://swagger.io/specification/) - Especificação para documentação de *APIs REST*
* [*Swagger UI*](https://swagger.io/tools/swagger-ui/) - *Interface* interativa para documentação da *API*


### *Frameworks and Libraries*

**Principais dependências:**
* `express` (^4.18.2) - *Framework* 
* `mysql2` (^3.6.5) - *Driver MySQL*/*MariaDB* para *Node.js* 
* `cors` (^2.8.5) - *Middleware* para habilitar *CORS* (*Cross-Origin Resource Sharing*)
* `swagger-ui-express` (^5.0.0) - Integração do *Swagger UI* com *Express*
* `yamljs` (^0.3.0) - *Parser YAML* para *JavaScript*
* `express-openapi-validator` (^5.4.0) - Validador automático de requisições e respostas baseado em *OpenAPI*

**Dependências de desenvolvimento:**
* `nodemon` (^3.0.2) - Ferramenta para desenvolvimento com *auto-reload*

## **Report**

### Apresentação do Projeto
* Chapter 1: [Apresentação do Projeto](doc/c1.md)
### Recursos
* Chapter 2: [Recursos](doc/c2.md)
### Produto
* Chapter 3: [Produto](doc/c3.md)
### Apresentação
* Chapter 4: [Apresentação](doc/c4.md)

## Grupo 13 - inf25dw1g13
* [Felipe Castilho](https://github.com/a047152) - a047152@umaia.pt
* [Juliana Moreira](https://github.com/julianaam13) - a047188@umaia.pt
* [Marta Vieira](https://github.com/xmarta19) - a046756@umaia.pt

