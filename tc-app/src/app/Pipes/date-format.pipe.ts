import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateformat',
    standalone: true
})
export class DateFormatPipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) private locale: string) { 
    }

    /**
     * Transforms a date into a localized string format.
     * @param date - The date to transform, can be a Date object, string, or number.
     * @param showTime - Whether to include the time part in a 24-hour format.
     * @param format - Optional format specifier: 'short', 'medium', 'long', 'full', 'custom', or 'numeric'.
     * @returns A localized date string.
     */
    transform(
        date: Date | string | number | null | undefined,
        showTime: boolean = false,
        format: 'short' | 'medium' | 'long' | 'full' | 'custom' | 'numeric' = 'numeric'
    ): string {
        if (!date) { return ''; }

        let dateObj: Date;
        if (typeof date === 'string' || typeof date === 'number') {
            dateObj = new Date(date);
        } else {
            dateObj = date;
        }

        // Check for invalid date
        if (isNaN(dateObj.getTime())) {
            return '';
        }

        // Use custom format (xx/xx/yyyy) - fixed format regardless of locale
        if (format === 'custom') {
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            const dateString = `${day}/${month}/${year}`;

            if (showTime) {
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                return `${dateString} ${hours}:${minutes}`;
            }
            return dateString;
        }

        try {
            // For numeric format (DD/MM/YYYY or MM/DD/YYYY based on locale)
            if (format === 'numeric') {

                const options: Intl.DateTimeFormatOptions = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                };
                
                if (showTime) {
                    options.hour = '2-digit';
                    options.minute = '2-digit';
                    options.hour12 = false;
                }

                // Get user's browser locale automatically
                const userLocale = navigator.language || this.locale;
                return new Intl.DateTimeFormat(userLocale, options).format(dateObj);
            }

            // Use Intl.DateTimeFormat for other formats (short, medium, long, full)
            if (showTime) {
                // Format with date and time in 24-hour format
                const options: Intl.DateTimeFormatOptions = {
                    dateStyle: format,
                    timeStyle: 'short',
                    hour12: false
                };

                return new Intl.DateTimeFormat(this.locale, options).format(dateObj);
            } else {
                // Format with date only
                const options: Intl.DateTimeFormatOptions = {
                    dateStyle: format
                };

                return new Intl.DateTimeFormat(this.locale, options).format(dateObj);
            }
        } catch (error) {
            // Fallback in case of any error with Intl API
            console.warn('DateFormat pipe error:', error);
            
            // Basic fallback formatting
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            
            // Default to DD/MM/YYYY
            const dateString = `${day}/${month}/${year}`;
            
            if (showTime) {
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                return `${dateString} ${hours}:${minutes}`;
            }
            return dateString;
        }
    }
}