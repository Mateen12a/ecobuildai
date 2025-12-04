import https from 'https';
import http from 'http';

const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function searchImages(query, count = 20) {
  const searchQuery = `${query} construction material photo`;
  
  if (GOOGLE_API_KEY && GOOGLE_CX) {
    return await googleImageSearch(searchQuery, count);
  }
  
  return await duckDuckGoImageSearch(searchQuery, count);
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
