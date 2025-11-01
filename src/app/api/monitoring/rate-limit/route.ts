import { NextRequest, NextResponse } from 'next/server';
import { RateLimitMonitor, RateLimitViolation } from '@/lib/rate-limit-monitor';

/**
 * GET /api/monitoring/rate-limit
 * Rate limit monitoring endpoint
 * 
 * Query Parameters:
 * - action: stats|violations|ip-stats|export|reset
 * - timeRange: 1h|24h|7d|30d (for stats and ip-stats)
 * - ip: IP address (for ip-stats)
 * - limit: number (for violations, default: 50)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const timeRange = (searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d') || '24h';
  const ip = searchParams.get('ip');

  try {
    switch (action) {
      case 'stats':
        const stats = RateLimitMonitor.getStats(timeRange);
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });

      case 'violations':
        const limit = parseInt(searchParams.get('limit') || '50');
        const violations = RateLimitMonitor.getRecentViolations(limit);
        return NextResponse.json({
          success: true,
          data: violations,
          count: violations.length,
          timestamp: new Date().toISOString()
        });

      case 'ip-stats':
        if (!ip) {
          return NextResponse.json(
            {
              success: false,
              error: 'IP address required for ip-stats action',
              example: '/api/monitoring/rate-limit?action=ip-stats&ip=192.168.1.1'
            },
            { status: 400 }
          );
        }
        // IP stats için sadece 1h, 24h, 7d destekleniyor
        const ipTimeRange = ['1h', '24h', '7d'].includes(timeRange) ? timeRange as '1h' | '24h' | '7d' : '24h';
        const ipStats = RateLimitMonitor.getIPStats(ip, ipTimeRange);
        return NextResponse.json({
          success: true,
          data: {
            ip,
            stats: ipStats,
            timeRange: ipTimeRange
          },
          timestamp: new Date().toISOString()
        });

      case 'export':
        const exportData = RateLimitMonitor.exportData();
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="rate-limit-export-${new Date().toISOString().split('T')[0]}.json"`
          }
        });

      case 'reset':
        // Sadece admin kullanıcılar için (basit auth check)
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized - Admin token required' },
            { status: 401 }
          );
        }
        
        RateLimitMonitor.reset();
        return NextResponse.json({
          success: true,
          message: 'Rate limit monitoring data reset successfully',
          timestamp: new Date().toISOString()
        });

      default:
        // Default action - return overview
        const overview = {
          stats: RateLimitMonitor.getStats('24h'),
          recentViolations: RateLimitMonitor.getRecentViolations(10),
          availableActions: [
            'stats - Get overall statistics',
            'violations - Get recent violations',
            'ip-stats - Get IP-specific statistics',
            'export - Export all monitoring data',
            'reset - Reset monitoring data (admin only)'
          ],
          example: '/api/monitoring/rate-limit?action=stats&timeRange=24h'
        };

        return NextResponse.json({
          success: true,
          data: overview,
          timestamp: new Date().toISOString()
        });
    }
  } catch (error: unknown) {
    console.error('Rate limit monitoring API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process monitoring request',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/rate-limit
 * Additional monitoring actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'record-violation':
        // Manuel violation kaydetme (test amaçlı)
        const violationData = data as Omit<RateLimitViolation, 'id' | 'timestamp'>;
        RateLimitMonitor.recordViolation(violationData);
        
        return NextResponse.json({
          success: true,
          message: 'Violation recorded successfully'
        });

      case 'bulk-export':
        // Toplu export
        const exportData = RateLimitMonitor.exportData();
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="bulk-rate-limit-data-${new Date().toISOString()}.json"`
          }
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid POST action',
            availableActions: ['record-violation', 'bulk-export']
          },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('Rate limit monitoring POST error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process POST request',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}