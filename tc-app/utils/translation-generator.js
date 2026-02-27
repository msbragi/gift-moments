"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var https = require("https");
// Configuration based on your app.config.ts
var sourceLanguage = 'en';
var targetLanguages = ['it', 'ge', 'fr', 'es', 'ru'];
var translationsPath = path.join(__dirname, '../src/assets/i18n');
var sourceFile = path.join(translationsPath, "".concat(sourceLanguage, ".json"));
// Language mapping (API uses different codes for some languages)
var languageMapping = {
    'en': 'en',
    'it': 'it',
    'fr': 'fr',
    'es': 'es',
    'ru': 'ru',
    'ge': 'ka' // Georgian is 'ka' in many APIs
};
// Collection of translation APIs
var translationAPIs = [
    // LibreTranslate API
    {
        name: 'LibreTranslate',
        translate: function (text, sourceLang, targetLang) {
            return new Promise(function (resolve, reject) {
                var apiLang = languageMapping[targetLang] || targetLang;
                var data = JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: apiLang
                });
                var options = {
                    hostname: 'libretranslate.de',
                    port: 443,
                    path: '/translate',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                    }
                };
                var req = https.request(options, function (res) {
                    var responseData = '';
                    res.on('data', function (chunk) { return responseData += chunk; });
                    res.on('end', function () {
                        if (res.statusCode === 429) {
                            reject(new Error('Rate limit exceeded'));
                            return;
                        }
                        try {
                            var parsed = JSON.parse(responseData);
                            if (parsed.translatedText) {
                                resolve(parsed.translatedText);
                            }
                            else {
                                reject(new Error('No translation found'));
                            }
                        }
                        catch (e) {
                            reject(new Error('Failed to parse response'));
                        }
                    });
                });
                req.on('error', function (error) {
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
        translate: function (text, sourceLang, targetLang) {
            return new Promise(function (resolve, reject) {
                var apiLang = languageMapping[targetLang] || targetLang;
                var encodedText = encodeURIComponent(text);
                var apiUrl = "https://api.mymemory.translated.net/get?q=".concat(encodedText, "&langpair=").concat(sourceLang, "|").concat(apiLang);
                https.get(apiUrl, function (res) {
                    var data = '';
                    res.on('data', function (chunk) { return data += chunk; });
                    res.on('end', function () {
                        try {
                            var parsedData = JSON.parse(data);
                            if (parsedData.responseData && parsedData.responseData.translatedText) {
                                resolve(parsedData.responseData.translatedText);
                            }
                            else {
                                reject(new Error('No translation found'));
                            }
                        }
                        catch (e) {
                            reject(new Error('Failed to parse response'));
                        }
                    });
                }).on('error', function (err) {
                    reject(err);
                });
            });
        }
    },
    // LingoCloud API
    {
        name: 'LingoCloud',
        translate: function (text, sourceLang, targetLang) {
            return new Promise(function (resolve, reject) {
                var apiLang = languageMapping[targetLang] || targetLang;
                var encodedText = encodeURIComponent(text);
                var options = {
                    hostname: 'api-free.deepl.com',
                    port: 443,
                    path: "/v2/translate?text=".concat(encodedText, "&source_lang=").concat(sourceLang.toUpperCase(), "&target_lang=").concat(apiLang.toUpperCase()),
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                };
                var req = https.request(options, function (res) {
                    var data = '';
                    res.on('data', function (chunk) { return data += chunk; });
                    res.on('end', function () {
                        if (res.statusCode === 429) {
                            reject(new Error('Rate limit exceeded'));
                            return;
                        }
                        try {
                            var parsed = JSON.parse(data);
                            if (parsed.translations && parsed.translations[0] && parsed.translations[0].text) {
                                resolve(parsed.translations[0].text);
                            }
                            else {
                                reject(new Error('No translation found'));
                            }
                        }
                        catch (e) {
                            reject(new Error('Failed to parse response'));
                        }
                    });
                });
                req.on('error', function (error) {
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
function translateText(text, targetLang) {
    return __awaiter(this, void 0, void 0, function () {
        var lastError, delay, attempt, _i, translationAPIs_1, api, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip translation for empty strings
                    if (!text.trim()) {
                        return [2 /*return*/, ''];
                    }
                    lastError = null;
                    delay = 1000;
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt < 3)) return [3 /*break*/, 9];
                    _i = 0, translationAPIs_1 = translationAPIs;
                    _a.label = 2;
                case 2:
                    if (!(_i < translationAPIs_1.length)) return [3 /*break*/, 8];
                    api = translationAPIs_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 7]);
                    console.log("Attempt ".concat(attempt + 1, " using ").concat(api.name, " for \"").concat(text, "\" to ").concat(targetLang));
                    return [4 /*yield*/, api.translate(text, sourceLanguage, targetLang)];
                case 4:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 5:
                    error_1 = _a.sent();
                    console.warn("".concat(api.name, " failed: ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    lastError = error_1 instanceof Error ? error_1 : new Error('Unknown error occurred');
                    // Wait before retrying
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                case 6:
                    // Wait before retrying
                    _a.sent();
                    delay *= 2; // Exponential backoff
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    attempt++;
                    return [3 /*break*/, 1];
                case 9:
                    console.error("All translation attempts failed for \"".concat(text, "\""));
                    return [2 /*return*/, text]; // Fall back to original text
            }
        });
    });
}
/**
 * Process nested objects recursively for translation
 */
function translateObject(obj_1, targetLang_1) {
    return __awaiter(this, arguments, void 0, function (obj, targetLang, prefix) {
        var result, _i, _a, key, currentKey, _b, _c, error_2, _d, _e;
        if (prefix === void 0) { prefix = ''; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    result = {};
                    _i = 0, _a = Object.keys(obj);
                    _f.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    key = _a[_i];
                    currentKey = prefix ? "".concat(prefix, ".").concat(key) : key;
                    if (!(typeof obj[key] === 'string')) return [3 /*break*/, 7];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 5, , 6]);
                    // Add delay to avoid rate limiting
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 3:
                    // Add delay to avoid rate limiting
                    _f.sent();
                    _b = result;
                    _c = key;
                    return [4 /*yield*/, translateText(obj[key], targetLang)];
                case 4:
                    _b[_c] = _f.sent();
                    console.log("[".concat(targetLang, "] ").concat(currentKey, ": \"").concat(obj[key], "\" => \"").concat(result[key], "\""));
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _f.sent();
                    console.error("Failed to translate ".concat(currentKey, ":"), error_2);
                    result[key] = obj[key]; // Keep original on failure
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 10];
                case 7:
                    if (!(obj[key] && typeof obj[key] === 'object')) return [3 /*break*/, 9];
                    _d = result;
                    _e = key;
                    return [4 /*yield*/, translateObject(obj[key], targetLang, currentKey)];
                case 8:
                    _d[_e] = _f.sent();
                    return [3 /*break*/, 10];
                case 9:
                    result[key] = obj[key];
                    _f.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 1];
                case 11: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Merge existing translations with new ones and translate only missing keys
 */
function mergeAndTranslate(source_1, target_1, lang_1) {
    return __awaiter(this, arguments, void 0, function (source, target, lang, path) {
        var result, _i, _a, key, currentPath, keyPath, _b, _c, error_3, _d, _e;
        if (path === void 0) { path = []; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    result = __assign({}, target);
                    _i = 0, _a = Object.keys(source);
                    _f.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 10];
                    key = _a[_i];
                    currentPath = __spreadArray(__spreadArray([], path, true), [key], false);
                    keyPath = currentPath.join('.');
                    if (!(typeof source[key] === 'string')) return [3 /*break*/, 7];
                    if (!!target[key]) return [3 /*break*/, 6];
                    // Add a delay to avoid rate limiting
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Add a delay to avoid rate limiting
                    _f.sent();
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 5, , 6]);
                    _b = result;
                    _c = key;
                    return [4 /*yield*/, translateText(source[key], lang)];
                case 4:
                    _b[_c] = _f.sent();
                    console.log("[".concat(lang, "] ").concat(keyPath, ": \"").concat(source[key], "\" => \"").concat(result[key], "\""));
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _f.sent();
                    console.error("Failed to translate ".concat(keyPath, ":"), error_3);
                    result[key] = source[key]; // Keep original on failure
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 9];
                case 7:
                    if (!(source[key] && typeof source[key] === 'object')) return [3 /*break*/, 9];
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    _d = result;
                    _e = key;
                    return [4 /*yield*/, mergeAndTranslate(source[key], target[key], lang, currentPath)];
                case 8:
                    _d[_e] = _f.sent();
                    _f.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Main function to generate all translations
 */
function generateTranslations() {
    return __awaiter(this, void 0, void 0, function () {
        var sourceContent, sourceTranslations, _i, targetLanguages_1, lang, targetFile, targetTranslations, targetContent, mergedTranslations, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    // Make sure output directory exists
                    if (!fs.existsSync(translationsPath)) {
                        fs.mkdirSync(translationsPath, { recursive: true });
                    }
                    // Read the source file (English)
                    if (!fs.existsSync(sourceFile)) {
                        throw new Error("Source file not found: ".concat(sourceFile));
                    }
                    sourceContent = fs.readFileSync(sourceFile, 'utf-8');
                    sourceTranslations = JSON.parse(sourceContent);
                    _i = 0, targetLanguages_1 = targetLanguages;
                    _a.label = 1;
                case 1:
                    if (!(_i < targetLanguages_1.length)) return [3 /*break*/, 4];
                    lang = targetLanguages_1[_i];
                    console.log("\nGenerating translations for ".concat(lang, "..."));
                    targetFile = path.join(translationsPath, "".concat(lang, ".json"));
                    targetTranslations = {};
                    if (fs.existsSync(targetFile)) {
                        console.log("File ".concat(lang, ".json already exists. Will only translate missing keys."));
                        targetContent = fs.readFileSync(targetFile, 'utf-8');
                        try {
                            targetTranslations = JSON.parse(targetContent);
                        }
                        catch (error) {
                            console.warn("Error parsing existing ".concat(lang, ".json file. Creating a new one."));
                        }
                    }
                    return [4 /*yield*/, mergeAndTranslate(sourceTranslations, targetTranslations, lang)];
                case 2:
                    mergedTranslations = _a.sent();
                    // Write the translated file
                    fs.writeFileSync(targetFile, JSON.stringify(mergedTranslations, null, 2), 'utf-8');
                    console.log("Successfully generated ".concat(lang, ".json"));
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('\nTranslation generation completed!');
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('Error generating translations:', error_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Run the translation generator
generateTranslations().catch(console.error);
