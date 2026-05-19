declare module 'sql.js' {
  interface SqlJsDatabase {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    bind(params: any[]): void;
    step(): boolean;
    get(): any[];
    getColumnNames(): string[];
    free(): void;
  }

  interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  interface SqlJsConfig {
    locateFile?: (path: string) => string;
  }

  interface InitSqlJsOutput {
    Database: new(data?: ArrayBuffer | Uint8Array | Buffer) => SqlJsDatabase;
  }

  function initSqlJs(config?: SqlJsConfig): Promise<InitSqlJsOutput>;

  export default initSqlJs;
  export { SqlJsDatabase, Statement, QueryExecResult };
}
