const express = require('express')
const https = require('https');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit();
const app = express()
const port = 3000

class messageCarousel  {   //Objeto base na qual serão adicionados os itens do carousel
    constructor(){
        this.itemType ="application/vnd.lime.document-select+json";
        this.items = []
    }
};

class itemCarousel {   //Classe para criar cada item do carousel
    constructor(nome, image_url, descricao) {
        this.header = {
            type: "application/vnd.lime.media-link+json",
            value: {
                type: "image/png",
                aspectRatio: "2:1",
                uri: "",
                title: "",
                text: ""
            }
        }
        this.header.value.uri = image_url;
        this.header.value.title = nome;
        this.header.value.text = descricao;
    }
};

function addItem(carousel,nome, descricao, image_url){    //Adiciona itens do Carousel no objeto base.
    var itemAdd = new itemCarousel(nome, descricao, image_url);
    carousel.items.push(itemAdd);
};

function processaListaRepos(carousel,listaRepos) {    //Recebe dados da request HTTP e abre uma função Lambda para processar.                  
    filtered = listaRepos.filter(function (value, index, arr) {
        return value.language == 'C#';      //filtrar apenas aqueles que são da linguagem C#
    });
    filtered.slice(0, 5).forEach(element => {     //Enviar apenas os 5 mais antigos (conforme ordenado na requisição)
        addItem(carousel,element.name, element.owner.avatar_url, element.description);    //Cria um item do Carousel e adiciona na lista a ser enviada
    });
}

app.get('/repos', (req, res) => {     //Caminho para requisição
    var carousel = new messageCarousel();
    octokit.rest.repos.listForOrg({   //Request usando Ocktokit, client oficial do github.
        org: "takenet",
        type: "public",
        sort: "created",              //Ordenar por data de criação
        direction: 'asc',             //Do mais antigo para o mais novo
        language: 'C#',               //Tentei filtrar por linguagem, mas não funciona.
    }).then(({ data }) => {           //Chamada async que aguarda os dados serem retornados.
        processaListaRepos(carousel,data);
        res.send(carousel);    //Envia resposta, fim da execução
    })
});

app.listen(port, () => {   //Inicia a escuta para requisições
    console.log(`Listening`);
})

module.exports = { //Necessario para executar no Cloud Functions.
    app
};