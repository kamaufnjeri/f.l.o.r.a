export interface CashFlowEntry {
  date: string;
  activity: string;
  line_item: string;
  description: string;
  cash_account: string;
  cash_in: number;
  cash_out: number;
  amount: number;
  net_amount: number;
}


export interface CashFlowLine {
  entries: CashFlowEntry[];
  total: number;
}


export interface CashFlowSection {
  entries: {
    [key: string]: CashFlowLine;
  };

  total: number;
}


export interface CashFlowResponse {

  operating: CashFlowSection;

  investing: CashFlowSection;

  financing: CashFlowSection;


  opening_cash: number;

  net_cash_flow: number;

  closing_cash: number;

  reconciles: boolean;

}