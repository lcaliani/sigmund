# Sigmund
Aplicação desktop de gerenciamento de clínica de psicologia para estudo da ferramenta Electron

## Pré-requisitos

- [`NodeJS >=16`](https://nodejs.org/en/)
- [`NPM >= 8`](https://nodejs.org/en/)

OBS: No Windows, também necessário que as ferramentas de build de módulos nativos do node seja instaladas. O instalador do node no windows já vem com a opção de instalar essas ferramentas logo após a instalação do próprio node.

## Instalação

```sh
npm i
```

## Uso

### Inicializar aplicação

#### No Linux/Mac

```sh
# Desenvolvimento, web console ativo
npm run start:dev

# Produção, web console oculto
npm run start:prod
```

#### No Windows

```sh
# Desenvolvimento, web console ativo
npm run start-win:dev

# Produção, web console oculto
npm run start-win:prod
```

### Criar executável

Os arquivos executáveis e de instalação podem ser encontrados na pasta `dist`, ao final do processo de build.

#### Para Linux e Windows (.deb e instalável Windows)

```sh
npm run dist
```

#### Somente Windows (instalável)

```sh
npm run dist:win
```