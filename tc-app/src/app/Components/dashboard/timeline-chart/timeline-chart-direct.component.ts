import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import {
  ActiveElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartData,
  ChartEvent,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Subscription } from 'rxjs';
import { ChartStatisticsService } from '../../../Services/api/chart-statistics.service';

// Register Chart.js components and plugins
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

@Component({
  selector: 'tc-timeline-chart-direct',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-instructions">
          <small>💡 Use Ctrl + mouse wheel to zoom, drag to pan</small>
        </div>
        <button type="button" class="reset-zoom-btn" (click)="resetZoom()" title="Reset Zoom">
          🔍 Reset Zoom ({{ zoomLevel }}%)
        </button>
      </div>
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }
    .chart-header {
      position: absolute;
      top: -5px;
      left: 60px;  /* Align with chart Y-axis */
      right: 30px; /* Align with chart boundaries */
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
    }
    .chart-instructions {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-primary);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      pointer-events: none;
      backdrop-filter: blur(4px);
    }
    .reset-zoom-btn {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      border: 1px solid var(--mat-sys-secondary);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      pointer-events: auto;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(4px);
    }
    .reset-zoom-btn:hover {
      background: var(--mat-sys-secondary);
      color: var(--mat-sys-on-secondary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    canvas {
      margin-top: 40px;
    }
  `]
})
export class TimelineChartDirectComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() chartData: ChartData<'line'> = { labels: [], datasets: [] };
  @Input() height: number = 400;
  
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private chart?: Chart;
  private chartOptionsSubscription?: Subscription;
  private baseChartOptions: any;
  zoomLevel: number = 100;

  // Configurazioni specifiche del componente (non legate al tema)
  private readonly componentSpecificConfig = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Count'
        }
      }
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
            modifierKey: 'ctrl'  // ✅ Richiede Ctrl + wheel per fare zoom
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          onZoom: ({chart}: {chart: Chart}) => {
            this.updateZoomLevel(chart);
          }
        },
        pan: {
          enabled: true,
          mode: 'xy',
          threshold: 10,
          onPan: ({chart}: {chart: Chart}) => {
            this.updateZoomLevel(chart);
          }
        }
      }
    },
    onClick: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        const dataset = this.chartData.datasets[datasetIndex];
        const value = dataset.data[dataIndex];
        
        console.log('Chart point clicked:', {
          datasetIndex,
          dataIndex,
          dataset: dataset.label,
          value
        });
      }
    }
  };

  constructor(private chartStatisticsService: ChartStatisticsService) {
    // Get initial base chart options
    this.baseChartOptions = this.chartStatisticsService.getChartOptions();
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.subscribeToChartOptions();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chartOptionsSubscription?.unsubscribe();
    this.chart?.destroy();
  }

  private subscribeToChartOptions(): void {
    // Subscribe to chart options changes (includes theme changes)
    this.chartOptionsSubscription = this.chartStatisticsService.chartOptions$.subscribe(
      (updatedOptions) => {
        this.baseChartOptions = updatedOptions;
        this.refreshChartTheme();
      }
    );
  }

  private refreshChartTheme(): void {
    if (this.chart) {
      // Merge updated base options with component-specific options
      const updatedOptions = this.buildChartOptions();
      
      // Update chart options
      this.chart.options = updatedOptions;
      this.chart.update();
    }
  }

  private initChart(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: this.chartData,
      options: this.buildChartOptions()
    };

    try {
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  private buildChartOptions(): any {
    // Deep merge usando il service (che fa forward al ChartJsHelper)
    const mergedOptions = this.chartStatisticsService.deepMergeChartOptions(
      this.baseChartOptions, 
      this.componentSpecificConfig
    );
    
    // Aggiungiamo i colori dei titoli degli assi dinamicamente
    if (mergedOptions.scales?.x?.title && this.baseChartOptions.scales?.x?.ticks?.color) {
      mergedOptions.scales.x.title.color = this.baseChartOptions.scales.x.ticks.color;
    }
    if (mergedOptions.scales?.y?.title && this.baseChartOptions.scales?.y?.ticks?.color) {
      mergedOptions.scales.y.title.color = this.baseChartOptions.scales.y.ticks.color;
    }
    
    return mergedOptions;
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.chartData;
      this.chart.update();
    }
  }

  resetZoom(): void {
    if (this.chart) {
      this.chart.resetZoom();
      this.zoomLevel = 100;
    }
  }

  private updateZoomLevel(chart: Chart): void {
    if (chart && chart.scales && chart.scales['x']) {
      const xScale = chart.scales['x'];
      const originalMin = 0;
      const originalMax = this.chartData.labels?.length ? this.chartData.labels.length - 1 : 100;
      const currentMin = xScale.min || 0;
      const currentMax = xScale.max || originalMax;
      
      const originalRange = originalMax - originalMin;
      const currentRange = currentMax - currentMin;
      
      this.zoomLevel = Math.round((originalRange / currentRange) * 100);
    }
  }
}
