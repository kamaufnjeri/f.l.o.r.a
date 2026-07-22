export type Account = {
  id:string;
  name:string;
  amount:number;
};


export type IncomeCategory = {
  total:number;
  sub_categories:{
    [key:string]:{
      accounts:Account[];
    }
  }
};


export type IncomeStatementResponse = {

  sales:{
    accounts:Account[];
    total:number;
  };

  sales_return:{
    amount:number;
  };

  net_sales:number;


  opening_stock:{
    amount:number;
  };


  purchases:{
    accounts:Account[];
    total:number;
  };


  purchase_return:{
    amount:number;
  };


  goods_available_for_sale:number;


  closing_stock:{
    amount:number;
    stocks:{
      id:string;
      name:string;
      amount:number;
      rate: number;
      quantity: number;
    }[]
  };


  cost_of_goods_sold:number;
  gross_profit:number;


  service_income:{
    accounts:Account[];
    total:number;
  };


  other_income:{
    categories:{
      [key:string]:IncomeCategory
    };
    total:number;
  };


  total_revenue:number;


  expenses:{
    categories:{
      [key:string]:IncomeCategory
    };
    total:number;
  };


  net_profit:number;

};
