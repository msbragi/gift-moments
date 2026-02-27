import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ChartData } from 'chart.js';
import { Observable, map, shareReplay, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { IResponse } from '../../Models/auth.interface';
import { ChartJsHelper, ChartStatistics, ThemeType } from '../../Utils/chart-js.helper';
import { ThemeService } from '../common/theme.service';
import { ApiService } from './api.service';


/**
 * Service to fetch real historical statistics from backend
 * Uses the new comprehensive dashboard endpoint with real historical data
 */
@Injectable({
  providedIn: 'root'
})
export class ChartStatisticsService {
  
  /**
   * Observable that emits chart options whenever theme changes
   */
  public readonly chartOptions$: Observable<any>;

  constructor(
    private apiService: ApiService,
    private translocoService: TranslocoService,
    private themeService: ThemeService
  ) {
    // Create the observable in the constructor (injection context)
    console.log('Creating chartOptions$ observable');
    this.chartOptions$ = toObservable(this.themeService.appTheme).pipe(
      startWith(this.themeService.appTheme()), // Emit current value immediately
      map((theme) => {
        console.log('Theme changed to:', theme);
        const options = this.getChartOptions();
        console.log('Generated chart options:', options);
        return options;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get comprehensive chart statistics with real historical data
   */
  getChartStatistics(): Observable<ChartStatistics> {
    return this.apiService.get<IResponse>('dashboard/chart-stats').pipe(
      map(response => response?.data || response)
    );
  }

  /**
   * Generate regular Chart.js compatible data (non-cumulative)
   */
  generateChartData(): Observable<ChartData<'line'>> {
    return this.getChartStatistics().pipe(
      map(stats => this.buildChartData(stats, false))
    );
  }

  /**
   * Generate cumulative Chart.js compatible data (progressive totals)
   */
  generateCumulativeChartData(): Observable<ChartData<'line'>> {
    return this.getChartStatistics().pipe(
      map(stats => this.buildChartData(stats, true))
    );
  }

  /**
   * Build Chart.js data structure with configurable cumulative mode
   * @param stats - Backend statistics data
   * @param cumulative - Whether to calculate cumulative totals
   */
  private buildChartData(stats: ChartStatistics, cumulative: boolean = false): ChartData<'line'> {
    const data: ChartData<'line'> = ChartJsHelper.buildChartData(stats, cumulative);
    const currentTheme = this.themeService.appTheme();
    const themeForColors: ThemeType = currentTheme === 'system' ? 'light' : currentTheme;
    const colors = ChartJsHelper.getColors(themeForColors);
    
    // Apply business logic: translate labels and assign colors
    data.datasets = data.datasets.map((dataset, index) => ({
      ...dataset,
      label: dataset.label ? this.translocoService.translate(dataset.label) : dataset.label,
      borderColor: colors.datasetColors[index % colors.datasetColors.length],
      backgroundColor: colors.datasetColors[index % colors.datasetColors.length] + '20' // Add transparency
    }));
    
    return data;
  }  /**
   * Get theme-aware chart options for Chart.js configuration
   */
  getChartOptions(): any {
    const currentTheme = this.themeService.appTheme();
    const themeForColors: ThemeType = currentTheme === 'system' ? 'light' : currentTheme;
    
    // Use ChartJsHelper only for layout and appearance
    return ChartJsHelper.getLayoutAndAppearanceOptions(themeForColors);
  }

  /**
   * Deep merge utility - forward to ChartJsHelper
   * Useful for components that need to merge chart options
   */
  deepMergeChartOptions(baseOptions: any, componentConfig: any): any {
    return ChartJsHelper.deepMerge(baseOptions, componentConfig);
  }

}
