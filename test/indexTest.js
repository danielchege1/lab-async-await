const chai = require('chai');
global.expect = chai.expect;

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');

// Load HTML content
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');

// Transform JavaScript using Babel
const { code: transformedScript } = babel.transformFileSync(
  path.resolve(__dirname, '..', 'index.js'),
  { presets: ['@babel/preset-env'] }
);

// Initialize JSDOM
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.fetch = async () => ({
  ok: true,
  json: async () => [{
    title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\n'
  }]
});

// Inject the transformed JavaScript into the virtual DOM
const scriptElement = dom.window.document.createElement("script");
scriptElement.textContent = transformedScript;
dom.window.document.body.appendChild(scriptElement);

// Expose JSDOM globals to the testing environment
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.XMLHttpRequest = dom.window.XMLHttpRequest;

describe('Asynchronous fetching', () => {
  before(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it('renders the fetched post in the list', () => {
    const postDisplay = document.querySelector("#post-list");
    expect(postDisplay.innerHTML).to.include('sunt aut');
  });

  it('creates an h1 and p element for the post', () => {
    const h1 = document.querySelector("h1");
    const p = document.querySelector("p");
    expect(h1.textContent).to.include("sunt aut facere repellat");
    expect(p.textContent).to.include("quia et suscipit\nsuscipit");
  });
});