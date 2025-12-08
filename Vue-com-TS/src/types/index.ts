
export interface FilterState {
  country: string;
  province: string;
  city: string;
  specificDate: string;
}

export interface StatsCard {
  title: string;
  value: string;
  iconPath: string;
  bgColor: string;
  iconColor: string;
}

export interface TableRow {
  date: string;
  cases: string;
  deaths: string;
  recovered: string;
  active: string;
}