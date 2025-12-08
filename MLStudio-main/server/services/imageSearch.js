import https from 'https';
import http from 'http';

const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCDTw2JfEagvn26Lfsf6rjQoTt8rqC-heo";
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "53590414-e5633b41d6f5db2def7f53e3d";

const MATERIAL_SEARCH_TERMS = {
  aggregate: ['crushed stone aggregate', 'gravel construction material', 'aggregate pile', 'road base aggregate', 'stone chips', 'crushed gravel texture', 'rock aggregate close up', 'construction aggregate'],
  concrete: ['concrete slab', 'poured concrete structure', 'gray concrete surface', 'reinforced concrete construction', 'concrete texture', 'wet concrete pour', 'concrete block surface', 'raw concrete finish'],
  concrete_pfa: ['PFA concrete construction', 'fly ash concrete slab', 'pulverized fuel ash concrete', 'low carbon concrete', 'fly ash admixture', 'pfa mix concrete'],
  concrete_ggbs: ['GGBS concrete', 'blast furnace slag concrete', 'green concrete construction', 'sustainable concrete slab', 'slag cement concrete'],
  bricks: ['red clay bricks', 'masonry bricks', 'fired clay brick wall', 'common brick construction', 'brick texture closeup', 'stacked bricks', 'brick pile', 'clay brick pattern', 'red brick masonry', 'brick surface'],
  concrete_block: ['cinder block', 'CMU concrete masonry unit', 'hollow concrete block', 'gray concrete block wall', 'breeze block', 'cement block texture', 'concrete block stack'],
  aerated_block: ['AAC blocks', 'autoclaved aerated concrete', 'lightweight concrete block', 'cellular concrete block', 'aircrete block', 'aerated block texture'],
  rammed_earth: ['rammed earth wall', 'pisé construction', 'earth wall texture', 'compressed earth building', 'rammed earth architecture', 'earth construction'],
  limestone_block: ['limestone building block', 'natural stone block', 'limestone masonry', 'cut limestone', 'limestone wall construction', 'limestone surface'],
  marble: ['marble slab building', 'natural marble stone', 'marble flooring material', 'polished marble construction', 'marble cladding', 'marble texture'],
  cement_mortar: ['cement mortar mix', 'mortar between bricks', 'cement sand mortar', 'masonry mortar', 'bricklaying mortar', 'fresh mortar'],
  steel: ['structural steel beam', 'steel construction', 'steel I-beam', 'metal building frame', 'steel rebar reinforcement', 'steel structure', 'construction steel', 'galvanized steel'],
  steel_section: ['steel beam section', 'H-beam steel', 'structural steel section', 'I-beam construction', 'steel girder', 'steel profile'],
  steel_pipe: ['steel pipe construction', 'galvanized steel tube', 'metal pipe building', 'steel piping system', 'steel tube'],
  stainless_steel: ['stainless steel sheet', 'stainless steel construction', 'polished metal facade', 'stainless steel cladding', 'stainless surface'],
  timber: ['construction timber', 'structural lumber', 'wood beam construction', 'timber framing', 'wooden building material', 'lumber pile', 'raw timber', 'wood planks'],
  glue_laminated_timber: ['glulam beam', 'laminated timber construction', 'engineered wood beam', 'glued laminated timber', 'glulam structure'],
  sawn_hardwood: ['hardwood lumber', 'sawn oak timber', 'hardwood beam', 'tropical hardwood plank', 'solid hardwood board'],
  insulation_cellulose: ['cellulose insulation', 'blown-in insulation', 'recycled paper insulation', 'loose fill cellulose', 'eco insulation material'],
  insulation_cork: ['cork insulation board', 'natural cork insulation', 'cork wall insulation', 'expanded cork panel'],
  insulation_glass_fibre: ['glass wool insulation', 'fiberglass batt insulation', 'glass fibre roll', 'yellow glass wool', 'fiberglass insulation'],
  insulation_cellular_glass: ['cellular glass insulation', 'foamglas insulation', 'foam glass board', 'glass foam insulation'],
  insulation_flax: ['flax insulation', 'natural flax fibre insulation', 'flax batt insulation', 'hemp flax insulation'],
  insulation_wool: ['sheep wool insulation', 'recycled wool insulation', 'natural wool thermal insulation', 'wool batt insulation'],
  straw_bale: ['straw bale building', 'straw bale construction', 'compressed straw wall', 'straw bale house'],
  insulation_rockwool: ['rockwool insulation', 'mineral wool slab', 'stone wool insulation', 'rock mineral wool'],
  insulation_eps: ['EPS insulation board', 'expanded polystyrene', 'white foam insulation', 'EPS foam panel', 'styrofoam insulation'],
  insulation_polyurethane: ['PUR insulation foam', 'polyurethane rigid foam', 'spray foam insulation', 'PIR insulation board'],
  insulation_woodwool: ['woodwool cement board', 'wood wool insulation', 'heraklith board', 'wood fibre insulation'],
  slate_uk: ['UK slate roof', 'Welsh slate tile', 'natural slate roofing', 'British slate construction'],
  slate_imported: ['Spanish slate roof', 'imported slate tile', 'natural stone slate', 'slate roofing material'],
  clay_tile: ['clay roof tile', 'terracotta roofing tile', 'red clay tile roof', 'ceramic roof tiles', 'terracotta tiles'],
  aluminum: ['aluminum cladding', 'aluminum construction profile', 'aluminum facade panel', 'aluminum building material', 'metal aluminum sheet', 'aluminum siding'],
  bitumen: ['bitumen roofing', 'tar felt roof', 'bituminous membrane', 'asphalt roofing material', 'bitumen waterproofing'],
  hardboard: ['hardboard sheet', 'high density fibreboard', 'HDF panel', 'masonite board'],
  mdf: ['MDF board', 'medium density fibreboard', 'MDF panel', 'furniture board material'],
  osb: ['OSB board', 'oriented strand board', 'OSB sheathing', 'chipboard panel', 'OSB texture'],
  plywood: ['plywood sheet', 'plywood panel construction', 'marine plywood', 'structural plywood', 'plywood layers'],
  plasterboard: ['gypsum board', 'drywall sheet', 'plasterboard construction', 'gypsum wallboard', 'sheetrock material'],
  gypsum_plaster: ['gypsum plaster wall', 'plaster render', 'wall plastering', 'gypsum coating'],
  glass: ['float glass panel', 'architectural glass', 'window glass construction', 'glass curtain wall', 'building glass facade', 'glass panel'],
  pvc: ['PVC material construction', 'plastic PVC sheet', 'vinyl PVC building', 'PVC profile'],
  pvc_pipe: ['PVC drain pipe', 'plastic plumbing pipe', 'white PVC tube', 'PVC drainage'],
  linoleum: ['linoleum flooring', 'natural lino floor', 'linoleum roll', 'lino floor covering'],
  pvc_vinyl_flooring: ['vinyl floor tile', 'PVC floor covering', 'vinyl plank flooring', 'sheet vinyl floor'],
  terrazzo_tiles: ['terrazzo floor tile', 'polished terrazzo', 'terrazzo flooring', 'aggregate terrazzo'],
  ceramic_tiles: ['ceramic floor tiles', 'wall ceramic tiles', 'glazed ceramic tile', 'porcelain tile construction', 'tile pattern', 'bathroom tiles'],
  wool_carpet: ['wool carpet flooring', 'natural wool rug', 'wool floor covering', 'woven wool carpet'],
  iron: ['cast iron construction', 'wrought iron building', 'iron beam structure', 'iron metalwork'],
  copper: ['copper roofing', 'copper cladding building', 'copper sheet metal', 'patina copper facade', 'copper pipe'],
  lead: ['lead roofing sheet', 'lead flashing construction', 'lead roof covering', 'rolled lead sheet'],
  ceramic_sanitary_ware: ['ceramic toilet', 'bathroom ceramic fixtures', 'porcelain sink', 'ceramic basin'],
  vitrified_clay_pipe: ['clay drainage pipe', 'vitrified clay sewer', 'ceramic drainage pipe', 'clay drain system']
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildSearchQueries(materialKey, baseName, page = 1) {
  const queries = [];
  const specificTerms = MATERIAL_SEARCH_TERMS[materialKey] || [];

  const allTerms = [...specificTerms];

  const suffixes = ['building material', 'construction', 'texture', 'closeup', 'surface', 'pattern', 'sample', 'photo', 'high quality'];
  const shuffledSuffixes = shuffleArray(suffixes);

  if (allTerms.length > 0) {
    const shuffledTerms = shuffleArray(allTerms);
    const startIdx = ((page - 1) * 3) % shuffledTerms.length;

    for (let i = 0; i < Math.min(5, shuffledTerms.length); i++) {
      const termIdx = (startIdx + i) % shuffledTerms.length;
      const suffixIdx = i % shuffledSuffixes.length;
      queries.push(`${shuffledTerms[termIdx]} ${shuffledSuffixes[suffixIdx]}`);
    }
  }

  const cleanName = baseName.replace(/\([^)]*\)/g, '').trim();
  queries.push(`${cleanName} construction material`);
  queries.push(`${cleanName} building supply`);

  if (page > 1) {
    const additionalTerms = ['real', 'authentic', 'raw', 'natural', 'professional'];
    const randomTerm = additionalTerms[Math.floor(Math.random() * additionalTerms.length)];
    queries.push(`${cleanName} ${randomTerm} material`);
  }

  return [...new Set(shuffleArray(queries))];
}

export async function searchImages(query, count = 100, materialKey = null, page = 1) {
  let searchQueries = [];

  if (materialKey && MATERIAL_SEARCH_TERMS[materialKey]) {
    searchQueries = buildSearchQueries(materialKey, query, page);
  } else {
    const suffixes = shuffleArray(['construction material photo', 'building material', 'texture closeup', 'surface pattern', 'sample image']);
    searchQueries = suffixes.slice(0, 3).map(suffix => `${query} ${suffix}`);
  }

  console.log(`Image search for: ${query} (key: ${materialKey}), page: ${page}, requesting ${count} images`);
  console.log(`Using queries: ${searchQueries.join(', ')}`);

  if (GOOGLE_API_KEY && GOOGLE_CX) {
    return await multiQueryGoogleSearch(searchQueries, count, page);
  }

  const allResults = [];

  for (const searchQuery of searchQueries) {
    if (allResults.length >= count) break;

    const remaining = Math.min(count - allResults.length, 50);

    let results = await pixabayImageSearch(searchQuery, remaining, page);

    if (results.length < remaining / 2) {
      const unsplashResults = await unsplashImageSearch(searchQuery, remaining - results.length, page);
      results = [...results, ...unsplashResults];
    }

    if (results.length === 0) {
      results = await duckDuckGoImageSearch(searchQuery, remaining);
    }

    const existingUrls = new Set(allResults.map(r => r.fullImageUrl));
    const newResults = results.filter(r => !existingUrls.has(r.fullImageUrl));
    allResults.push(...newResults);
  }

  return shuffleArray(allResults).slice(0, count);
}

async function multiQueryGoogleSearch(queries, count, page = 1) {
  const allResults = [];
  const perQuery = Math.ceil(count / queries.length);

  for (const query of queries) {
    if (allResults.length >= count) break;

    const results = await googleImageSearch(query, perQuery, page);
    const existingUrls = new Set(allResults.map(r => r.fullImageUrl));
    const newResults = results.filter(r => !existingUrls.has(r.fullImageUrl));
    allResults.push(...newResults);
  }

  return shuffleArray(allResults).slice(0, count);
}

async function googleImageSearch(query, count, page = 1) {
  const results = [];
  const perPage = 10;
  const startOffset = (page - 1) * count;
  const pages = Math.ceil(count / perPage);

  for (let p = 0; p < pages && results.length < count; p++) {
    const start = startOffset + p * perPage + 1;
    if (start > 100) break;

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
      console.log('Could not get DuckDuckGo token');
      return results;
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
  }

  return results;
}

async function pixabayImageSearch(query, count, page = 1) {
  const results = [];

  const apiKey = PIXABAY_API_KEY;
  if (!apiKey) {
    console.log('Pixabay API key not configured');
    return results;
  }

  try {
    const perPage = Math.min(count, 100);
    const pixabayUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${perPage}&page=${page}&safesearch=true&order=${page % 2 === 0 ? 'latest' : 'popular'}`;
    const response = await fetchJson(pixabayUrl);

    if (response.hits) {
      for (const item of response.hits.slice(0, count)) {
        results.push({
          id: `px_${item.id}_${Date.now()}`,
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

  return results;
}

async function unsplashImageSearch(query, count, page = 1) {
  const results = [];

  try {
    const orderBy = ['relevant', 'latest'][page % 2];
    const unsplashUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&page=${page}&order_by=${orderBy}`;
    const response = await fetchJson(unsplashUrl);

    if (response.results) {
      for (const item of response.results.slice(0, count)) {
        results.push({
          id: `us_${item.id}_${Date.now()}`,
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

  return results;
}

function fetchJson(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    };

    const makeRequest = (attemptNum) => {
      protocol.get(url, options, (res) => {
        const contentType = res.headers['content-type'] || '';
        
        if (res.statusCode === 429) {
          console.log('Rate limited, retrying after delay...');
          if (attemptNum < retries) {
            setTimeout(() => makeRequest(attemptNum + 1), 2000 * attemptNum);
            return;
          }
          reject(new Error('Rate limited - too many requests'));
          return;
        }

        if (res.statusCode !== 200) {
          console.log(`HTTP ${res.statusCode} for ${url.substring(0, 50)}...`);
          reject(new Error(`HTTP error: ${res.statusCode}`));
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (contentType.includes('text/html')) {
            console.log('Received HTML instead of JSON, API may have changed or returned error page');
            reject(new Error('Received HTML response instead of JSON'));
            return;
          }

          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            const preview = data.substring(0, 200);
            console.error(`Invalid JSON response (first 200 chars): ${preview}`);
            if (attemptNum < retries) {
              console.log(`Retrying... (attempt ${attemptNum + 1}/${retries})`);
              setTimeout(() => makeRequest(attemptNum + 1), 1000 * attemptNum);
            } else {
              reject(new Error(`Invalid JSON response: ${e.message}`));
            }
          }
        });
      }).on('error', (err) => {
        if (attemptNum < retries) {
          console.log(`Network error, retrying... (attempt ${attemptNum + 1}/${retries})`);
          setTimeout(() => makeRequest(attemptNum + 1), 1000 * attemptNum);
        } else {
          reject(err);
        }
      }).on('timeout', () => {
        if (attemptNum < retries) {
          console.log(`Timeout, retrying... (attempt ${attemptNum + 1}/${retries})`);
          setTimeout(() => makeRequest(attemptNum + 1), 1000 * attemptNum);
        } else {
          reject(new Error('Request timeout'));
        }
      });
    };

    makeRequest(1);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    };

    protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('Request timeout')));
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
