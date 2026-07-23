import Link from "next/link";
import { IncomeExpense } from "./types";

type Props = {
  organisationId: string;
  currency?: string;
  data: IncomeExpense;
};


function formatMoney(
  value: number,
  currency?: string
) {
  return `${currency ?? ""} ${value.toLocaleString()}`;
}


export default function IncomeExpenseCard({
  organisationId,
  currency,
  data,
}: Props) {


  const items = [
    {
      label: "Sales",
      value: data.sales,
      color: "text-green-600",
    },

    {
      label: "Service Income",
      value: data.total_service_income,
      color: "text-blue-600",
      link: `/dashboard/${organisationId}/service-income`,
    },

    {
      label: "Other Income",
      value: data.total_other_income,
      color: "text-purple-600",
    },

    {
      label: "Purchases",
      value: data.purchases,
      color: "text-orange-600",
    },

    {
      label: "Expenses",
      value: data.expenses,
      color: "text-red-600",
    },
  ];


  return (

    <div
      className="
        bg-white
        border
        border-gray-100
        rounded-2xl
        shadow-sm
        p-5
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-5
        "
      >

        <div>

          <h2
            className="
              text-base
              font-semibold
              text-primary
            "
          >
            Income vs Expense
          </h2>


          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Business performance overview
          </p>

        </div>


        <Link
          href={`/dashboard/${organisationId}/income-statement`}
          className="
            text-sm
            font-medium
            text-primary
            hover:underline
          "
        >
          Income Statement
        </Link>


      </div>



      {/* CONTENT */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-3
        "
      >

        {items.map((item) => (

          <div
            key={item.label}
            className="
              rounded-xl
              border
              border-gray-100
              bg-gray-50/50
              p-4
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              {item.label}
            </p>


            {item.link ? (

              <Link
                href={item.link}
                className={`
                  mt-2
                  block
                  text-lg
                  font-semibold
                  ${item.color}
                  hover:underline
                `}
              >
                {formatMoney(
                  item.value,
                  currency
                )}
              </Link>

            ) : (

              <p
                className={`
                  mt-2
                  text-lg
                  font-semibold
                  ${item.color}
                `}
              >
                {formatMoney(
                  item.value,
                  currency
                )}
              </p>

            )}


          </div>

        ))}

      </div>



      {/* PROFIT FOOTER */}

      <div
        className="
          mt-5
          rounded-xl
          bg-gradient-to-r
          from-primary/10
          to-gray-50
          p-4
          flex
          items-center
          justify-between
        "
      >

        <div>

          <p
            className="
              text-xs
              uppercase
              tracking-wide
              text-gray-500
            "
          >
            Net Profit
          </p>

          <p
            className="
              mt-1
              text-xl
              font-bold
              text-primary
            "
          >
            {formatMoney(
              data.profit,
              currency
            )}
          </p>

        </div>


        <Link
          href={`/dashboard/${organisationId}/income-statement`}
          className="
            rounded-xl
            bg-primary
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            hover:bg-primary-dark
          "
        >
          View Report
        </Link>


      </div>


    </div>

  );
}
