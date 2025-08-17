export interface INav {
  name?: string;
  url?: string;
  icon?: string;
  expanded?: boolean;
  children?: INav[];
}
