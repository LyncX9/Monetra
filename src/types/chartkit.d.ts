declare module "react-native-chart-kit" {
  import * as React from "react";
  import { ViewStyle } from "react-native";

  export interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }

  export interface PieChartProps {
    data: PieChartData[];
    width: number;
    height: number;
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
    chartConfig: any;
    hasLegend?: boolean;
    center?: [number, number];
    absolute?: boolean;
    style?: ViewStyle;
  }

  export class PieChart extends React.Component<PieChartProps> {}
}

declare module "react-native-chart-kit" {
  import * as React from "react";
  import { ViewStyle } from "react-native";

  export interface LineChartDataset {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }

  export interface LineChartData {
    labels: string[];
    datasets: LineChartDataset[];
  }

  export interface LineChartProps {
    data: LineChartData;
    width: number;
    height: number;
    yAxisSuffix?: string;
    yAxisInterval?: number;
    chartConfig: any;
    bezier?: boolean;
    style?: ViewStyle;
  }

  export class LineChart extends React.Component<LineChartProps> {}
}
