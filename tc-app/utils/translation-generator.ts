import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Configuration based on your app.config.ts
const sourceLanguage = 'en';
const targetLanguages = ['it', 'ka', 'fr', 'es', 'ru'];
const translationsPath = path.join(__dirname, '../src/assets/i18n');
const sourceFile = path.join(translationsPath, `${sourceLanguage}.json`);

// Language mapping (API uses different codes for some languages)
const languageMapping: Record<string, string> = {
  'en': 'en',
  'it': 'it',
  'fr': 'fr',
  'es': 'es',
  'ru': 'ru',
  'ka': 'ka' // Georgian is 'ka' in many APIs
};

// Translation API interfaces
interface TranslationAPI {
  name: string;
  skip: boolean;
  translate: (text: string, sourceLang: string, targetLang: string) => Promise<string>;
}

// Collection of translation APIs
const translationAPIs: TranslationAPI[] = [
  // LibreTranslate API
  {
    name: 'LibreTranslate',
    skip: false,
    translate: (text: string, sourceLang: string, targetLang: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const apiLang = languageMapping[targetLang] || targetLang;
        const data = JSON.stringify({
          q: text,
          source: sourceLang,
          target: apiLang
        });
        
        const options = {
          hostname: 'libretranslate.de',
          port: 443,
          path: '/translate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
        };
        
        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => responseData += chunk);
          res.on('end', () => {
            if (res.statusCode === 429) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            try {
              const parsed = JSON.parse(responseData);
              if (parsed.translatedText) {
                resolve(parsed.translatedText);
              } else {
                reject(new Error('No translation found'));
              }
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          });
        });
        
        req.on('error', (error) => {
          // Set skip flag if connection refused
          if (error.message.includes('ECONNREFUSED')) {
            const apiIndex = translationAPIs.findIndex(api => api.name === 'LibreTranslate');
            if (apiIndex !== -1) {
              translationAPIs[apiIndex].skip = true;
              console.log(`🚫 Disabling LibreTranslate due to connection error: ${error.message}`);
            }
          }
          reject(error);
        });
        
        req.write(data);
        req.end();
      });
    }
  },
  
  // MyMemory API
  {
    name: 'MyMemory',
    skip: false,
    translate: (text: string, sourceLang: string, targetLang: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const apiLang = languageMapping[targetLang] || targetLang;
        const encodedText = encodeURIComponent(text);
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${apiLang}`;
        
        const req = https.get(apiUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.responseData && parsedData.responseData.translatedText) {
                resolve(parsedData.responseData.translatedText);
              } else {
                reject(new Error('No translation found'));
              }
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          });
        });

        req.on('error', (error) => {
          // Set skip flag if connection refused
          if (error.message.includes('ECONNREFUSED')) {
            const apiIndex = translationAPIs.findIndex(api => api.name === 'MyMemory');
            if (apiIndex !== -1) {
              translationAPIs[apiIndex].skip = true;
              console.log(`🚫 Disabling MyMemory due to connection error: ${error.message}`);
            }
          }
          reject(error);
        });
      });
    }
  },
  
  // LingoCloud API
  {
    name: 'LingoCloud',
    skip: false,
    translate: (text: string, sourceLang: string, targetLang: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const apiLang = languageMapping[targetLang] || targetLang;
        const encodedText = encodeURIComponent(text);
        
        const options = {
          hostname: 'api-free.deepl.com',
          port: 443,
          path: `/v2/translate?text=${encodedText}&source_lang=${sourceLang.toUpperCase()}&target_lang=${apiLang.toUpperCase()}`,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 429) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.translations && parsed.translations[0] && parsed.translations[0].text) {
                resolve(parsed.translations[0].text);
              } else {
                reject(new Error('No translation found'));
              }
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          });
        });
        
        req.on('error', (error) => {
          // Set skip flag if connection refused
          if (error.message.includes('ECONNREFUSED')) {
            const apiIndex = translationAPIs.findIndex(api => api.name === 'LingoCloud');
            if (apiIndex !== -1) {
              translationAPIs[apiIndex].skip = true;
              console.log(`🚫 Disabling LingoCloud due to connection error: ${error.message}`);
            }
          }
          reject(error);
        });
        
        req.end();
      });
    }
  }
];

/**
 * Translates text using available APIs with retry and backoff
 */
async function translateText(text: string, targetLang: string): Promise<string> {
  // Skip translation for empty strings
  if (!text.trim()) {
    return '';
  }
  
  // Try each API in sequence with backoff
  let delay = 1000; // Start with 1 second delay
  
  for (let attempt = 0; attempt < 3; attempt++) {
    // Try each API that isn't skipped
    for (const api of translationAPIs) {
      // Skip this API if the skip flag is true
      if (api.skip) {
        console.log(`⏩ Skipping ${api.name} (marked as unavailable)`);
        continue;
      }
      
      try {
        console.log(`🔄 Attempt ${attempt+1} using ${api.name} for "${text}" to ${targetLang}`);
        const result = await api.translate(text, sourceLanguage, targetLang);
        console.log(`✅ Successfully translated with ${api.name}`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`❌ ${api.name} failed: ${errorMessage}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    // Check if all APIs are skipped
    const allSkipped = translationAPIs.every(api => api.skip);
    if (allSkipped) {
      console.error('⛔ All translation services are unavailable');
      return text; // Return original text if all services are skipped
    }
  }
  
  console.error(`⚠️ All translation attempts failed for "${text}"`);
  return text; // Fall back to original text
}

/**
 * Process nested objects recursively for translation
 */
async function translateObject(obj: any, targetLang: string, prefix = ''): Promise<any> {
  const result: any = {};

  for (const key of Object.keys(obj)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'string') {
      try {
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        result[key] = await translateText(obj[key], targetLang);
        console.log(`🔤 [${targetLang}] ${currentKey}: "${obj[key]}" => "${result[key]}"`);
      } catch (error) {
        console.error(`❌ Failed to translate ${currentKey}:`, error);
        result[key] = obj[key]; // Keep original on failure
      }
    } else if (obj[key] && typeof obj[key] === 'object') {
      result[key] = await translateObject(obj[key], targetLang, currentKey);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Merge existing translations with new ones and translate only missing keys
 */
async function mergeAndTranslate(source: any, target: any, lang: string, path: string[] = []): Promise<any> {
  const result: any = { ...target };
  
  for (const key of Object.keys(source)) {
    const currentPath = [...path, key];
    const keyPath = currentPath.join('.');
    
    if (typeof source[key] === 'string') {
      if (!target[key]) {
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          result[key] = await translateText(source[key], lang);
          console.log(`📝 [${lang}] ${keyPath}: "${source[key]}" => "${result[key]}"`);
        } catch (error) {
          console.error(`❌ Failed to translate ${keyPath}:`, error);
          result[key] = source[key]; // Keep original on failure
        }
      }
    } else if (source[key] && typeof source[key] === 'object') {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      result[key] = await mergeAndTranslate(source[key], target[key], lang, currentPath);
    }
  }
  
  return result;
}

/**
 * Main function to generate all translations
 */
async function generateTranslations(): Promise<void> {
  try {
    console.log('🚀 Starting translation generation...');
    
    // Make sure output directory exists
    if (!fs.existsSync(translationsPath)) {
      fs.mkdirSync(translationsPath, { recursive: true });
      console.log(`📁 Created translations directory at ${translationsPath}`);
    }
    
    // Read the source file (English)
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`);
    }
    
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const sourceTranslations = JSON.parse(sourceContent);
    console.log('📄 Loaded source translations from English file');
    
    // Process each target language
    for (const lang of targetLanguages) {
      console.log(`\n🌐 Generating translations for ${lang}...`);
      
      // Check if target file already exists
      const targetFile = path.join(translationsPath, `${lang}.json`);
      let targetTranslations: any = {};
      
      if (fs.existsSync(targetFile)) {
        console.log(`📄 File ${lang}.json already exists. Will only translate missing keys.`);
        const targetContent = fs.readFileSync(targetFile, 'utf-8');
        try {
          targetTranslations = JSON.parse(targetContent);
        } catch (error) {
          console.warn(`⚠️ Error parsing existing ${lang}.json file. Creating a new one.`);
        }
      }
      
      // Merge and translate
      const mergedTranslations = await mergeAndTranslate(sourceTranslations, targetTranslations, lang);
      
      // Write the translated file
      fs.writeFileSync(
        targetFile,
        JSON.stringify(mergedTranslations, null, 2),
        'utf-8'
      );
      
      console.log(`✅ Successfully generated ${lang}.json`);
    }
    
    console.log('\n🎉 Translation generation completed!');
  } catch (error) {
    console.error('❌ Error generating translations:', error);
  }
}

// Run the translation generator
generateTranslations().catch(console.error);