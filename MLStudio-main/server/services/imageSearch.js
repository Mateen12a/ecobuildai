import https from 'https';
import http from 'http';

const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const MATERIAL_SEARCH_TERMS = {
  aggregate: ['crushed stone aggregate', 'gravel construction material', 'aggregate pile', 'road base aggregate', 'stone chips'],
  concrete: ['concrete slab', 'poured concrete structure', 'gray concrete surface', 'reinforced concrete construction', 'concrete texture'],
  concrete_pfa: ['PFA concrete construction', 'fly ash concrete slab', 'pulverized fuel ash concrete', 'low carbon concrete'],
  concrete_ggbs: ['GGBS concrete', 'blast furnace slag concrete', 'green concrete construction', 'sustainable concrete slab'],
  bricks: ['red clay bricks', 'masonry bricks', 'fired clay brick wall', 'common brick construction', 'brick texture closeup'],
  concrete_block: ['cinder block', 'CMU concrete masonry unit', 'hollow concrete block', 'gray concrete block wall', 'breeze block'],
  aerated_block: ['AAC blocks', 'autoclaved aerated concrete', 'lightweight concrete block', 'cellular concrete block', 'aircrete block'],
  rammed_earth: ['rammed earth wall', 'pisé construction', 'earth wall texture', 'compressed earth building', 'rammed earth architecture'],
  limestone_block: ['limestone building block', 'natural stone block', 'limestone masonry', 'cut limestone', 'limestone wall construction'],
  marble: ['marble slab building', 'natural marble stone', 'marble flooring material', 'polished marble construction', 'marble cladding'],
  cement_mortar: ['cement mortar mix', 'mortar between bricks', 'cement sand mortar', 'masonry mortar', 'bricklaying mortar'],
  steel: ['structural steel beam', 'steel construction', 'steel I-beam', 'metal building frame', 'steel rebar reinforcement'],
  steel_section: ['steel beam section', 'H-beam steel', 'structural steel section', 'I-beam construction', 'steel girder'],
  steel_pipe: ['steel pipe construction', 'galvanized steel tube', 'metal pipe building', 'steel piping system'],
  stainless_steel: ['stainless steel sheet', 'stainless steel construction', 'polished metal facade', 'stainless steel cladding'],
  timber: ['construction timber', 'structural lumber', 'wood beam construction', 'timber framing', 'wooden building material'],
  glue_laminated_timber: ['glulam beam', 'laminated timber construction', 'engineered wood beam', 'glued laminated timber', 'glulam structure'],
  sawn_hardwood: ['hardwood lumber', 'sawn oak timber', 'hardwood beam', 'tropical hardwood plank', 'solid hardwood board'],
  insulation_cellulose: ['cellulose insulation', 'blown-in insulation', 'recycled paper insulation', 'loose fill cellulose', 'eco insulation material'],
  insulation_cork: ['cork insulation board', 'natural cork insulation', 'cork wall insulation', 'expanded cork panel'],
  insulation_glass_fibre: ['glass wool insulation', 'fiberglass batt insulation', 'glass fibre roll', 'yellow glass wool'],
  insulation_cellular_glass: ['cellular glass insulation', 'foamglas insulation', 'foam glass board', 'glass foam insulation'],
  insulation_flax: ['flax insulation', 'natural flax fibre insulation', 'flax batt insulation', 'hemp flax insulation'],
  insulation_wool: ['sheep wool insulation', 'recycled wool insulation', 'natural wool thermal insulation', 'wool batt insulation'],
  straw_bale: ['straw bale building', 'straw bale construction', 'compressed straw wall', 'straw bale house'],
  insulation_rockwool: ['rockwool insulation', 'mineral wool slab', 'stone wool insulation', 'rock mineral wool'],
  insulation_eps: ['EPS insulation board', 'expanded polystyrene', 'white foam insulation', 'EPS foam panel'],
  insulation_polyurethane: ['PUR insulation foam', 'polyurethane rigid foam', 'spray foam insulation', 'PIR insulation board'],
  insulation_woodwool: ['woodwool cement board', 'wood wool insulation', 'heraklith board', 'wood fibre insulation'],
  slate_uk: ['UK slate roof', 'Welsh slate tile', 'natural slate roofing', 'British slate construction'],
  slate_imported: ['Spanish slate roof', 'imported slate tile', 'natural stone slate', 'slate roofing material'],
  clay_tile: ['clay roof tile', 'terracotta roofing tile', 'red clay tile roof', 'ceramic roof tiles'],
  aluminum: ['aluminum cladding', 'aluminum construction profile', 'aluminum facade panel', 'aluminum building material', 'metal aluminum sheet'],
  bitumen: ['bitumen roofing', 'tar felt roof', 'bituminous membrane', 'asphalt roofing material'],
  hardboard: ['hardboard sheet', 'high density fibreboard', 'HDF panel', 'masonite board'],
  mdf: ['MDF board', 'medium density fibreboard', 'MDF panel', 'furniture board material'],
  osb: ['OSB board', 'oriented strand board', 'OSB sheathing', 'chipboard panel'],
  plywood: ['plywood sheet', 'plywood panel construction', 'marine plywood', 'structural plywood'],
  plasterboard: ['gypsum board', 'drywall sheet', 'plasterboard construction', 'gypsum wallboard', 'sheetrock material'],
  gypsum_plaster: ['gypsum plaster wall', 'plaster render', 'wall plastering', 'gypsum coating'],
  glass: ['float glass panel', 'architectural glass', 'window glass construction', 'glass curtain wall', 'building glass facade'],
  pvc: ['PVC material construction', 'plastic PVC sheet', 'vinyl PVC building', 'PVC profile'],
  pvc_pipe: ['PVC drain pipe', 'plastic plumbing pipe', 'white PVC tube', 'PVC drainage'],
  linoleum: ['linoleum flooring', 'natural lino floor', 'linoleum roll', 'lino floor covering'],
  pvc_vinyl_flooring: ['vinyl floor tile', 'PVC floor covering', 'vinyl plank flooring', 'sheet vinyl floor'],
  terrazzo_tiles: ['terrazzo floor tile', 'polished terrazzo', 'terrazzo flooring', 'aggregate terrazzo'],
  ceramic_tiles: ['ceramic floor tiles', 'wall ceramic tiles', 'glazed ceramic tile', 'porcelain tile construction', 'tile pattern'],
  wool_carpet: ['wool carpet flooring', 'natural wool rug', 'wool floor covering', 'woven wool carpet'],
  iron: ['cast iron construction', 'wrought iron building', 'iron beam structure', 'iron metalwork'],
  copper: ['copper roofing', 'copper cladding building', 'copper sheet metal', 'patina copper facade'],
  lead: ['lead roofing sheet', 'lead flashing construction', 'lead roof covering', 'rolled lead sheet'],
  ceramic_sanitary_ware: ['ceramic toilet', 'bathroom ceramic fixtures', 'porcelain sink', 'ceramic basin'],
  vitrified_clay_pipe: ['clay drainage pipe', 'vitrified clay sewer', 'ceramic drainage pipe', 'clay drain system']
};

function buildSearchQueries(materialKey, baseName) {
  const queries = [];
  const specificTerms = MATERIAL_SEARCH_TERMS[materialKey] || [];
  
  if (specificTerms.length > 0) {
    queries.push(...specificTerms.slice(0, 3).map(term => `${term} building material`));
  }
  
  const cleanName = baseName.replace(/\([^)]*\)/g, '').trim();
  queries.push(`${cleanName} construction material photo`);
  queries.push(`${cleanName} building supply`);
  
  return [...new Set(queries)];
}

export async function searchImages(query, count = 20, materialKey = null) {
  let searchQueries = [];
  
  if (materialKey && MATERIAL_SEARCH_TERMS[materialKey]) {
    searchQueries = buildSearchQueries(materialKey, query);
  } else {
    searchQueries = [`${query} construction material photo`];
  }
  
  console.log(`Image search for: ${query} (key: ${materialKey})`);
  console.log(`Using queries: ${searchQueries.join(', ')}`);
  
  if (GOOGLE_API_KEY && GOOGLE_CX) {
    return await multiQueryGoogleSearch(searchQueries, count);
  }
  
  const allResults = [];
  
  for (const searchQuery of searchQueries) {
    if (allResults.length >= count) break;
    
    const remaining = count - allResults.length;
    let results = await duckDuckGoImageSearch(searchQuery, remaining);
    
    if (results.length === 0) {
      results = await fallbackImageSearch(searchQuery, remaining);
    }
    
    const existingUrls = new Set(allResults.map(r => r.fullImageUrl));
    const newResults = results.filter(r => !existingUrls.has(r.fullImageUrl));
    allResults.push(...newResults);
  }
  
  return allResults.slice(0, count);
}

async function multiQueryGoogleSearch(queries, count) {
  const allResults = [];
  const perQuery = Math.ceil(count / queries.length);
  
  for (const query of queries) {
    if (allResults.length >= count) break;
    
    const results = await googleImageSearch(query, perQuery);
    const existingUrls = new Set(allResults.map(r => r.fullImageUrl));
    const newResults = results.filter(r => !existingUrls.has(r.fullImageUrl));
    allResults.push(...newResults);
  }
  
  return allResults.slice(0, count);
}

async function googleImageSearch(query, count) {
  const results = [];
  const perPage = 10;
  const pages = Math.ceil(count / perPage);
  
  for (let page = 0; page < pages && results.length < count; page++) {
    const start = page * perPage + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&searchType=image&num=${perPage}&start=${start}&safe=active&imgSize=medium`;
    
    try {
      const response = await fetchJson(url);
      if (response.items) {
        for (const item of response.items) {
          if (results.length >= count) break;
          results.push({
            id: Buffer.from(item.link).toString('base64').slice(0, 32),
            thumbnailUrl: item.image?.thumbnailLink || item.link,
            fullImageUrl: item.link,
            source: item.displayLink || new URL(item.link).hostname,
            title: item.title || '',
            width: item.image?.width || 0,
            height: item.image?.height || 0
          });
        }
      }
    } catch (error) {
      console.error('Google search error:', error.message);
    }
  }
  
  return results;
}

async function duckDuckGoImageSearch(query, count) {
  const results = [];
  
  try {
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const tokenResponse = await fetchText(tokenUrl);
    
    const vqdMatch = tokenResponse.match(/vqd=['"]([^'"]+)['"]/);
    if (!vqdMatch) {
      console.log('Could not get DuckDuckGo token, using fallback search');
      return await fallbackImageSearch(query, count);
    }
    
    const vqd = vqdMatch[1];
    const searchUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`;
    
    const response = await fetchJson(searchUrl);
    
    if (response.results) {
      for (const item of response.results.slice(0, count)) {
        results.push({
          id: Buffer.from(item.image || item.thumbnail).toString('base64').slice(0, 32),
          thumbnailUrl: item.thumbnail,
          fullImageUrl: item.image,
          source: item.source || new URL(item.image).hostname,
          title: item.title || '',
          width: item.width || 0,
          height: item.height || 0
        });
      }
    }
  } catch (error) {
    console.error('DuckDuckGo search error:', error.message);
    return await fallbackImageSearch(query, count);
  }
  
  return results;
}

async function fallbackImageSearch(query, count) {
  const results = [];
  
  try {
    const unsplashUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`;
    const response = await fetchJson(unsplashUrl);
    
    if (response.results) {
      for (const item of response.results.slice(0, count)) {
        results.push({
          id: item.id,
          thumbnailUrl: item.urls?.thumb || item.urls?.small,
          fullImageUrl: item.urls?.regular || item.urls?.full,
          source: 'unsplash.com',
          title: item.description || item.alt_description || '',
          width: item.width || 0,
          height: item.height || 0
        });
      }
    }
  } catch (error) {
    console.error('Unsplash search error:', error.message);
  }
  
  if (results.length === 0) {
    try {
      const pixabayUrl = `https://pixabay.com/api/?key=45796987-0d3cbcef1c0a4821f0acbd4e8&q=${encodeURIComponent(query)}&image_type=photo&per_page=${count}`;
      const response = await fetchJson(pixabayUrl);
      
      if (response.hits) {
        for (const item of response.hits.slice(0, count)) {
          results.push({
            id: String(item.id),
            thumbnailUrl: item.previewURL,
            fullImageUrl: item.webformatURL || item.largeImageURL,
            source: 'pixabay.com',
            title: item.tags || '',
            width: item.webformatWidth || item.imageWidth,
            height: item.webformatHeight || item.imageHeight
          });
        }
      }
    } catch (error) {
      console.error('Pixabay search error:', error.message);
    }
  }
  
  return results;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    
    protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

export async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      },
      timeout: 15000
    };
    
    const request = protocol.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}
