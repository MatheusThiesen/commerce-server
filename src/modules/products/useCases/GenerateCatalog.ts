import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrderBy } from '../../../utils/OrderBy.utils';
import { ProductsService } from '../products.service';
import { AgroupGridProduct } from './AgroupGridProduct';
import { VariationsProduct } from './VariationsProduct';

interface ListProductsFiltersProps {
  referencesProduct: string[];
  orderBy: string;
  groupProduct?: boolean;
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
  grids: string[];

  groupProduct: boolean;
  variations?: VariationsProps[];
}

type VariationsProps = {
  imageMain: string;
  reference: string;
};

@Injectable()
export class GenerateCatalog {
  readonly noimage =
    'https://alpar.sfo3.digitaloceanspaces.com/Alpar/no-image.jpg';
  readonly spaceLink = 'https://alpar.sfo3.digitaloceanspaces.com/';

  constructor(
    private prisma: PrismaService,
    private orderByProcess: OrderBy,
    private productsService: ProductsService,
    private agroupGridProduct: AgroupGridProduct,
    private variationsProduct: VariationsProduct,
  ) {}

  async generateGrid(grids: string[]) {
    let gridsNormalized = '';

    for (const grid of grids) {
      gridsNormalized += `<dt>${grid}</dt>`;
    }

    return gridsNormalized;
  }

  async generateVariations(variations: VariationsProps[]) {
    let variationsNormalized = '';

    for (const variation of variations) {
      variationsNormalized += `    
      
        <div>
          <img
            class="variation-image"
            src="https://alpar.sfo3.digitaloceanspaces.com/Produtos/${variation.reference}_01"
            onerror="this.onerror=null; this.src='https://alpar.sfo3.digitaloceanspaces.com/Alpar/no-image.jpg'"
          />
        </div>
      
`;
    }

    return variationsNormalized;
  }

  async generatePages({ pages, dateNow }: generatePagesProps): Promise<string> {
    let pagesHtml = '';

    for (const page of pages) {
      const gridsHtml = await this.generateGrid(page.grids);
      const variations = await this.generateVariations(page.variations);
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
            ${
              page.groupProduct
                ? `<span class="reference">Cód. Agrupador: ${page.alternativeCode}</span>`
                : `<span class="reference">Referência: ${page.reference}</span>`
            }
            
            <p class="title">${page.description}</p>
            ${
              page.groupProduct
                ? ''
                : `<p class="color">Cor: ${page.colors}</p>`
            }

            <p class="price">PDV: <b>${page.price}</b></p>

            ${
              page.groupProduct
                ? `
                  <div class="container-variations">
                    ${variations}
                  </div>`
                : ''
            }
            <div>
              <p class="price">GRADES</p>
              <dl class="listGrids">
              ${gridsHtml}
              </dl>
            </div>

            <div>
              <p class="price">CARACTERÍSTICAS GERAIS</p>
              
              <dl class="listInfo">
                <dt>Marca</dt>
                <dd>${page.brand}</dd>
                <dt>Gênero</dt>
                <dd>${page.genre}</dd>
                <dt>Linha</dt>
                <dd>${page.line}</dd>
              </dl>
            </div>
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

  async execute({
    referencesProduct,
    orderBy,
    groupProduct,
  }: ListProductsFiltersProps): Promise<string> {
    const products = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoAdicional: true,
        precoVenda: true,
        descricaoComplementar: true,
        precoVendaEmpresa: true,
        genero: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
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
        ...this.productsService.listingRule(),
        referencia: {
          in: referencesProduct,
        },
      },
      orderBy: [
        {
          generoCodigo: 'asc',
        },
        this.orderByProcess.execute(orderBy),
      ],
    });

    const background = ``;
    const dateNow = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const productsNormalized: PageData[] = [];
    for (const product of products) {
      const grids = (
        await this.agroupGridProduct.execute({
          reference: product.referencia,
          query: this.productsService.listingRule(),
        })
      ).map((grid) => `${product.codigo} - ${grid.descricaoAdicional}`);

      let variations: VariationsProps[] = [];

      if (!!groupProduct) {
        const getVariationsProduct = await this.variationsProduct.execute({
          alternativeCode: product.codigoAlternativo,
          query: this.productsService.listingRule(),
        });

        variations = getVariationsProduct
          .filter((f) => f.referencia !== product.referencia)
          .map((v) => ({
            imageMain:
              `${this.spaceLink}Produtos/${product.referencia}_01` as string,
            reference: v.referencia,
          }));
      }

      const newPage: PageData = {
        groupProduct: !!groupProduct,
        variations: variations,

        imageMain:
          `${this.spaceLink}Produtos/${product.referencia}_01` as string,
        alternativeCode: product.codigoAlternativo,
        reference: product.referencia,
        description: product.descricao,
        descriptionAdditional: product.descricaoAdicional,
        colors:
          product?.corPrimaria?.descricao &&
          product?.corSecundaria?.cor?.descricao
            ? `${product.corPrimaria.descricao} e ${product.corSecundaria.cor.descricao}`
            : product.corPrimaria.descricao,
        price: product.precoVenda.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        }),
        brand: product?.marca?.descricao ?? '-',
        colection: product?.colecao?.descricao ?? '-',
        genre: product?.genero?.descricao ?? '-',
        group: product?.grupo?.descricao ?? '-',
        subgroup: product?.subGrupo?.descricao ?? '-',
        line: product?.linha?.descricao ?? '-',
        grids: grids,
      };

      productsNormalized.push(newPage);
    }

    const pages = await this.generatePages({
      dateNow,
      pages: productsNormalized,
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

        @page { size: landscape; }
  
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
          margin-top: 0.4rem;
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
        .listGrids {
          margin-top: 0.4rem;
          display: flex;
          width: 100%;
          flex-wrap: wrap;
        }
        .listGrids > dt {
          width: 100%;
          font-size: 0.855rem;
          line-height: 1.25rem;
          color: #444;
        }
        .listGrids > dd {
          width: 50%;
          font-weight: 600;
          font-size: 0.855rem;
          line-height: 1.25rem;
          color: #333;
        }

        .container-variations {
          display: flex;
          flex-wrap: wrap;
        }
        .container-variations > div {
          border: 1.5px solid #555;
          border-radius: 8px;
          padding: 1px;
          margin-top: 1rem;
        }
        .container-variations > div + div {
          margin-left: 6px;
        }
        .variation-image {
          height: 75px;
          max-width: 75px;
          object-fit: contain;
        }
      </style>
    </head>
      <body>
        ${pages}

        <script>
          document.addEventListener("DOMContentLoaded", function(){
            alert('carregou');
          })
        </script>
      </body>
    </html>
    `;

    return html;
  }
}
