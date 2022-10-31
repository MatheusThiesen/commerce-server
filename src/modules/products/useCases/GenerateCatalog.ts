import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

interface ListProductsFiltersProps {
  codProducts: number[];
}

interface generatePagesProps {
  pages: PageData[];
  dateNow: string;
}

interface PageData {
  imageMain: string;
  reference: string;
  description: string;
  descriptionAdditional: string;
  alternativeCode: string;
  colors: string;
  price: string;
  brand: string;
  colection: string;
  genre: string;
  group: string;
  subgroup: string;
  line: string;
}

@Injectable()
export class GenerateCatalog {
  readonly noimage =
    'https://alpar.sfo3.digitaloceanspaces.com/Alpar/no-image.jpg';
  readonly spaceLink = 'https://alpar.sfo3.digitaloceanspaces.com/';

  constructor(private prisma: PrismaService) {}

  async generatePages({ pages, dateNow }: generatePagesProps): Promise<string> {
    let pagesHtml = '';

    for (const page of pages) {
      const generatePage = `<div class="page">
      <header class="header"></header>
      <div class="content">
        <div class="container-main">
          <img
            class="image-main"
            src="${page.imageMain}"
            onerror="this.onerror=null; this.src='${this.noimage}'"
          />
        </div>

        <div class="container-detail">
          <div class="container-info">
            <span class="reference">Referência: ${page.reference}</span>
            <p class="title">${page.description}</p>
            <p class="color">Cor: ${page.colors}</p>
            <p class="price">PDV: <b>${page.price}</b></p>

            <dl class="listInfo">
              <dt>Marca</dt>
              <dd>${page.brand}</dd>
              <dt>Coleção</dt>
              <dd>${page.colection}</dd>
              <dt>Gênero</dt>
              <dd>${page.genre}</dd>
              <dt>Grupo</dt>
              <dd>${page.group}</dd>
              <dt>Subgrupo</dt>
              <dd>${page.subgroup}</dd>
              <dt>Linha</dt>
              <dd>${page.line}</dd>
            </dl>
          </div>
        </div>

        
      </div>
      <footer class="footer">
      <date>Data de criação ${dateNow}</date>
      </footer>
    </div>`;

      pagesHtml += generatePage;
    }

    return pagesHtml;
  }

  async execute({ codProducts }: ListProductsFiltersProps): Promise<string> {
    const products = await this.prisma.produto.findMany({
      select: {
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoAdicional: true,
        precoVenda: true,
        descricaoComplementar: true,
        marca: {
          select: {
            descricao: true,
          },
        },
        grupo: {
          select: {
            descricao: true,
          },
        },
        subGrupo: {
          select: {
            descricao: true,
          },
        },
        linha: {
          select: {
            descricao: true,
          },
        },
        colecao: {
          select: {
            descricao: true,
          },
        },
        corPrimaria: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        corSecundaria: {
          select: {
            cor: {
              select: {
                descricao: true,
              },
            },
          },
        },
      },
      where: {
        codigo: {
          in: codProducts,
        },
      },
      orderBy: {
        precoVenda: 'asc',
      },
    });

    const background = ``;
    const dateNow = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const pages = await this.generatePages({
      dateNow,
      pages: products.map((product) => ({
        imageMain: `${this.spaceLink}Produtos/${product.referencia}_01`,
        alternativeCode: product.codigoAlternativo,
        reference: product.referencia,
        description: product.descricao,
        descriptionAdditional: product.descricaoAdicional,
        colors:
          product.corPrimaria.descricao && product.corSecundaria.cor.descricao
            ? `${product.corPrimaria.descricao} e ${product.corSecundaria.cor.descricao}`
            : product.corPrimaria.descricao,
        price: product.precoVenda.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        }),
        brand: product.marca.descricao,
        colection: product.colecao.descricao,
        genre: '-',
        group: product.grupo.descricao,
        subgroup: product.subGrupo.descricao,
        line: product.linha.descricao,
      })),
    });

    const html = `
    <html>
    <head>
      <meta charset="utf8" />
      <title>Catalogo</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          outline: 0 !important;
          box-sizing: border-box;
          font-family: "Roboto", sans-serif;
        }
  
        * {
          --cor-principal: #333;
        }
  
        html,
        body,
        #root {
          margin: 0;
          padding: 0;
  
          font-family: sans-serif;
          font-weight: 500;
  
          background: rgb(200, 200, 200);
          -webkit-print-color-adjust: exact;
          box-sizing: border-box;
        }
  
        .page {
          position: relative;
          display: block;
          width: 297mm;
          height: 210mm;
  
          page-break-after: auto;
          margin: auto;
          margin-top: 50px;
          margin-bottom: 50px;
          overflow: hidden;
  
          background: #fff;
          background-image: url(${background});
          background-size: contain;
          background-repeat: round;
        }
  
        @media print {
          body {
            background: transparent;
          }
  
          .actions-print {
            display: none;
          }
  
          .page {
            margin: 0;
            height: 100%;
            width: 100%;
  
            background-image: url(${background});
            background-size: contain;
            background-repeat: round;
          }
        }
  
        .image-default {
          position: relative;
          height: 100%;
          width: 100%;
          margin: auto;
          object-fit: contain;
        }
  
        .header {
          height: 5%;
          width: 100%;
        }
  
        .footer {
          width: 100%;
          height: 10%;
  
          position: relative;
        }
  
        .footer > date {
          color: var(--cor-principal);
  
          position: absolute;
          right: 5mm;
          bottom: 30px;
          font-size: 14px;
        }
  
        .content {
          width: 100%;
          height: 85%;
          padding: 0 36px;
  
          display: flex;
          align-items: center;
          justify-content: center;
        }
  
        .container-main {
          width: calc(60% - 1rem);
          margin-right: 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
  
        /* Imagens */
  
        .image-main {
          width: 100%;
          height: 88%;
          object-fit: contain;
          /* border: 2.5px solid var(--cor-principal); */
        }
  
        /* Variações */
        .container-detail {
          flex: 1;
          height: 100%;
          padding: 0 0 0 20px;
        }
  
        /* Informações */
        .container-info {
          width: 100%;
          margin-top: 20%;
  
          display: flex;
          flex-direction: column;
        }
  
        .container-info > .container-texts {
          width: 45%;
  
          display: flex;
          justify-content: space-evenly;
          flex-direction: column;
  
          font-size: 0.95rem;
          color: var(--cor-principal);
        }
  
        .container-info > .container-texts > span {
          height: 35px;
        }
  
        .container-variation {
          margin-top: 60px;
          height: 60%;
          width: 100%;
  
          gap: 10px;
          display: grid;
          justify-content: space-between;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }
        .container-image-color {
          position: relative;
          height: 100%;
          font-size: 12px;
          font-weight: lighter;
        }
        .container-image-color > .miniature-color {
          object-fit: contain;
          height: 175px;
          width: 118px;
          /* height: 140px; */
          /* width: 100%; */
          border: 2.5px solid #000;
        }
        .container-image-color > .no-color {
          width: 100%;
          height: 92px;
          border: 2.5px solid #000;
        }
        .container-image-color > .no-color::after {
          content: "";
          top: -13px;
          position: absolute;
          height: 120px;
          width: 4px;
          background: #f00;
          transform: rotate(45deg);
          right: 44px;
        }
        .container-image-color > div {
          display: flex;
          justify-content: center;
          padding: 2px 0 0 0;
        }
  
        .title {
          font-size: 2.5rem;
        }
        .reference {
          font-size: 1rem;
          color: #555;
        }
        .price {
          font-size: 1.5rem;
          margin-top: 1rem;
        }
        .color {
          margin-top: 0.5rem;
          color: #555;
          font-size: 0.875rem;
        }

        .listInfo {
          margin-top: 2.5rem;
          display: flex;
          width: 100%;
          flex-wrap: wrap;
        }
        .listInfo > dt {
          width: 50%;
          font-size: 0.855rem;
          line-height: 1.25rem;
          color: #444;
        }
        .listInfo > dd {
          width: 50%;
          font-weight: 600;
          font-size: 0.855rem;
          line-height: 1.25rem;
          color: #333;
        }
      </style>
    </head>
      <body>

        ${pages}
      </body>
    </html>
    `;

    return html;
  }
}
