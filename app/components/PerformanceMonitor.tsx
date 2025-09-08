'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fcp: number | null;
  cls: number | null;
  fid: number | null;
  ttfb: number | null;
}

const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

    const metrics: PerformanceMetrics = {
      lcp: null,
      fcp: null,
      cls: null,
      fid: null,
      ttfb: null
    };

    // Track Core Web Vitals
    const logMetric = (name: string, value: number, target: number) => {
      const status = value <= target ? '✅' : '❌';
      console.log(`%c${status} ${name}: ${value.toFixed(2)}ms (target: ≤${target}ms)`, 
        `color: ${value <= target ? '#22c55e' : '#ef4444'}; font-weight: bold`
      );
    };

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      metrics.lcp = lastEntry.startTime;
      if (metrics.lcp !== null) {
        logMetric('LCP (Largest Contentful Paint)', metrics.lcp, 2500);
      }
    });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          if (metrics.fcp !== null) {
            logMetric('FCP (First Contentful Paint)', metrics.fcp, 1800);
          }
        }
      });
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      let clsValue = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.cls = clsValue;
      console.log(`%c${clsValue <= 0.1 ? '✅' : '❌'} CLS (Cumulative Layout Shift): ${clsValue.toFixed(4)} (target: ≤0.1)`, 
        `color: ${clsValue <= 0.1 ? '#22c55e' : '#ef4444'}; font-weight: bold`
      );
    });

    // Time to First Byte
    const ttfbObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'navigation') {
          metrics.ttfb = entry.responseStart - entry.requestStart;
          if (metrics.ttfb !== null) {
            logMetric('TTFB (Time to First Byte)', metrics.ttfb, 800);
          }
        }
      });
    });

    // Start observers
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      ttfbObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.log('Performance observer not supported:', error);
    }

    // Bundle size analysis
    const analyzeBundle = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalJS = 0;
        let totalCSS = 0;
        
        resources.forEach((resource) => {
          if (resource.name.includes('.js')) {
            totalJS += resource.transferSize || 0;
          } else if (resource.name.includes('.css')) {
            totalCSS += resource.transferSize || 0;
          }
        });

        const formatBytes = (bytes: number) => {
          const kb = bytes / 1024;
          return kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`;
        };

        console.group('📦 Bundle Analysis');
        console.log(`%cJavaScript: ${formatBytes(totalJS)} ${totalJS > 1000000 ? '❌ (>1MB)' : '✅'}`, 
          `color: ${totalJS > 1000000 ? '#ef4444' : '#22c55e'}; font-weight: bold`);
        console.log(`%cCSS: ${formatBytes(totalCSS)} ${totalCSS > 200000 ? '❌ (>200KB)' : '✅'}`, 
          `color: ${totalCSS > 200000 ? '#ef4444' : '#22c55e'}; font-weight: bold`);
        console.groupEnd();
      }
    };

    // Run bundle analysis after load
    window.addEventListener('load', () => {
      setTimeout(analyzeBundle, 1000);
      
      // Summary after all metrics are collected
      setTimeout(() => {
        console.group('🚀 Performance Summary');
        console.log('Core Web Vitals collected. Check individual metrics above.');
        console.log('💡 Tip: Run Lighthouse audit for complete analysis');
        console.groupEnd();
      }, 2000);
    });

    return () => {
      lcpObserver.disconnect();
      fcpObserver.disconnect();
      clsObserver.disconnect();
      ttfbObserver.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;