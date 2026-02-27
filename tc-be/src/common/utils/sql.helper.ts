export class SqlHelper {
    private static dbType: string;

    private static getDbType(): string {
        if (!this.dbType) {
            this.dbType = process.env.DB_TYPE || 'mysql';
        }
        return this.dbType;
    }

    /**
     * Extract date parts using ANSI SQL EXTRACT function
     * Standard across MySQL, PostgreSQL, Oracle
     */
    static datepart(part: 'YEAR' | 'MONTH' | 'DAY' | 'HOUR' | 'MINUTE' | 'SECOND', dateColumn: string): string {
        return `EXTRACT(${part} FROM ${dateColumn})`;
    }

    /**
     * Concatenate multiple values
     * @param values - Values to concatenate (separators included in values)
     */
    static concat(...values: string[]): string {
        switch (this.getDbType()) {
            case 'sqlite':
                return values.join(' || ');
            case 'pgsql':
            case 'postgres':
            case 'postgresql':
            case 'mysql':
            default:
                return `CONCAT(${values.join(', ')})`;
        }
    }

    /**
     * Left pad a value with specified character
     */
    static lpad(value: string, length: number, padChar: string = '0'): string {
        switch (this.getDbType()) {
            case 'pgsql':
            case 'postgres':
            case 'postgresql':
                return `LPAD(${value}::text, ${length}, '${padChar}')`;
            case 'mysql':
                return `LPAD(${value}, ${length}, '${padChar}')`;
            case 'sqlite':
                if (padChar === '0') {
                    return `printf('%0${length}d', ${value})`;
                }
                return `substr('${padChar.repeat(length)}' || ${value}, -${length})`;
            default:
                return `LPAD(${value}, ${length}, '${padChar}')`;
        }
    }

    /**
     * Create a period string in YYYY-MM format
     */
    static yearMonthPeriod(dateColumn: string): string {
        const year = this.datepart('YEAR', dateColumn);
        const month = this.lpad(this.datepart('MONTH', dateColumn).toString(), 2, '0');
        
        return this.concat(year.toString(), "'-'", month);
    }

    /**
     * Cast value to text/string for cross-database compatibility
     */
    static toString(value: string): string {
        switch (this.getDbType()) {
            case 'pgsql':
            case 'postgres':
            case 'postgresql':
                return `${value}::text`;
            case 'mysql':
            case 'sqlite':
            default:
                return value;
        }
    }

    /**
     * Current timestamp function
     */
    static now(): string {
        switch (this.getDbType()) {
            case 'pgsql':
            case 'postgres':
            case 'postgresql':
            case 'mysql':
                return 'NOW()';
            case 'sqlite':
                return "datetime('now')";
            default:
                return 'CURRENT_TIMESTAMP';
        }
    }
}