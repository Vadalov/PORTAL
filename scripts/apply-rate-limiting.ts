/**
 * Rate Limiting Automation Script
 * Otomatik olarak tüm API endpoint'lerine rate limiting uygular
 */

import fs from 'fs';
import path from 'path';

interface EndpointInfo {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  hasRateLimit: boolean;
  rateLimitType: string;
}

const API_DIR = 'src/app/api';
const RATE_LIMIT_IMPORTS = `import { 
  authRateLimit,
  dataModificationRateLimit,
  readOnlyRateLimit,
  uploadRateLimit,
  searchRateLimit,
  dashboardRateLimit
} from '@/lib/rate-limit';`;

function classifyEndpoint(pathname: string, method: string): { type: string; rateLimitFunction: string } {
  const pathSegments = pathname.toLowerCase().split('/');
  
  // Authentication endpoints
  if (pathSegments.includes('auth')) {
    return { type: 'auth', rateLimitFunction: 'authRateLimit' };
  }
  
  // Upload endpoints
  if (pathSegments.includes('storage') || pathname.includes('upload')) {
    return { type: 'upload', rateLimitFunction: 'uploadRateLimit' };
  }
  
  // Dashboard endpoints
  if (pathSegments.includes('dashboard')) {
    return { type: 'dashboard', rateLimitFunction: 'dashboardRateLimit' };
  }
  
  // Search endpoints
  if (pathSegments.includes('search') || pathname.includes('search')) {
    return { type: 'search', rateLimitFunction: 'searchRateLimit' };
  }
  
  // Data modification (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    return { type: 'modify', rateLimitFunction: 'dataModificationRateLimit' };
  }
  
  // Default read-only for GET requests
  return { type: 'read', rateLimitFunction: 'readOnlyRateLimit' };
}

function applyRateLimitToRoute(filePath: string, method: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Check if rate limiting is already applied
    if (content.includes('RateLimit')) {
      console.log(`⏭️  Skipping ${filePath} - already has rate limiting`);
      return false;
    }
    
    // Add imports if not present
    if (!content.includes('@/lib/rate-limit')) {
      // Find the first import line and add rate limit imports after it
      const importMatch = content.match(/^import.*from.*['"`]/m);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          `${importMatch[0]}\n${RATE_LIMIT_IMPORTS}`
        );
      } else {
        // Add at the top if no imports found
        content = `${RATE_LIMIT_IMPORTS}\n\n${content}`;
      }
    }
    
    // Determine rate limit type
    const relativePath = path.relative('src/app', filePath);
    const { rateLimitFunction } = classifyEndpoint(relativePath, method);
    
    // Apply rate limiting
    if (content.includes('export const GET =')) {
      content = content.replace(
        /export const GET = ([^;]+);/,
        `export const GET = ${rateLimitFunction}($1);`
      );
    } else if (content.includes('export async function POST(')) {
      content = content.replace(
        /export async function POST\(/,
        `export const POST = ${rateLimitFunction}(async (`
      );
      content = content.replace(
        /}\s*$/,
        `});`
      );
    } else if (content.includes('export function POST(')) {
      content = content.replace(
        /export function POST\(/,
        `export const POST = ${rateLimitFunction}((`
      );
      content = content.replace(
        /}\s*$/,
        `});`
      );
    } else if (content.includes('export const POST =')) {
      content = content.replace(
        /export const POST = ([^;]+);/,
        `export const POST = ${rateLimitFunction}($1);`
      );
    } else if (content.includes('export async function PUT(')) {
      content = content.replace(
        /export async function PUT\(/,
        `export const PUT = ${rateLimitFunction}(async (`
      );
      content = content.replace(
        /}\s*$/,
        `});`
      );
    } else if (content.includes('export const PUT =')) {
      content = content.replace(
        /export const PUT = ([^;]+);/,
        `export const PUT = ${rateLimitFunction}($1);`
      );
    } else if (content.includes('export async function DELETE(')) {
      content = content.replace(
        /export async function DELETE\(/,
        `export const DELETE = ${rateLimitFunction}(async (`
      );
      content = content.replace(
        /}\s*$/,
        `});`
      );
    } else if (content.includes('export const DELETE =')) {
      content = content.replace(
        /export const DELETE = ([^;]+);/,
        `export const DELETE = ${rateLimitFunction}($1);`
      );
    }
    
    // Write updated content
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Applied ${rateLimitFunction} to ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

function scanApiDirectory(dirPath: string): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  
  function scanDirectory(currentPath: string, relativePath: string = '') {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const itemRelativePath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, itemRelativePath);
      } else if (item === 'route.ts') {
        // Found an API route
        const routePath = `/api/${itemRelativePath.replace('/route.ts', '').replace(/\\/g, '/')}`;
        
        // Try to determine HTTP method from file content
        const content = fs.readFileSync(fullPath, 'utf-8');
        const methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[] = [];
        
        if (content.includes('export const GET') || content.includes('export function GET')) {
          methods.push('GET');
        }
        if (content.includes('export const POST') || content.includes('export async function POST') || content.includes('export function POST')) {
          methods.push('POST');
        }
        if (content.includes('export const PUT') || content.includes('export async function PUT')) {
          methods.push('PUT');
        }
        if (content.includes('export const DELETE') || content.includes('export async function DELETE')) {
          methods.push('DELETE');
        }
        if (content.includes('export const PATCH') || content.includes('export async function PATCH')) {
          methods.push('PATCH');
        }
        
        for (const method of methods) {
          endpoints.push({
            path: routePath,
            method,
            hasRateLimit: content.includes('@/lib/rate-limit'),
            rateLimitType: classifyEndpoint(routePath, method).rateLimitFunction
          });
        }
      }
    }
  }
  
  scanDirectory(dirPath);
  return endpoints;
}

async function applyRateLimitingToAllEndpoints() {
  console.log('🚀 Starting rate limiting automation...');
  
  const apiDir = path.join(process.cwd(), API_DIR);
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found:', apiDir);
    return;
  }
  
  const endpoints = scanApiDirectory(apiDir);
  console.log(`📊 Found ${endpoints.length} endpoint methods`);
  
  let modifiedCount = 0;
  
  for (const endpoint of endpoints) {
    const filePath = path.join(apiDir, endpoint.path.replace('/api/', ''), 'route.ts');
    
    if (fs.existsSync(filePath)) {
      const modified = applyRateLimitToRoute(filePath, endpoint.method);
      if (modified) modifiedCount++;
    }
  }
  
  console.log(`\n🎉 Rate limiting automation completed!`);
  console.log(`📈 Modified ${modifiedCount} files`);
  console.log(`📋 Total endpoints: ${endpoints.length}`);
  console.log(`🔒 Rate limited: ${modifiedCount} files`);
  
  // Summary by rate limit type
  const typeStats: Record<string, number> = {};
  endpoints.forEach(ep => {
    typeStats[ep.rateLimitType] = (typeStats[ep.rateLimitType] || 0) + 1;
  });
  
  console.log('\n📊 Rate Limit Distribution:');
  Object.entries(typeStats).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} endpoints`);
  });
}

// Execute if run directly
if (require.main === module) {
  applyRateLimitingToAllEndpoints().catch(console.error);
}

export { applyRateLimitingToAllEndpoints, scanApiDirectory, classifyEndpoint };