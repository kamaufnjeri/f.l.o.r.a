import Link from "next/link";
import { InventorySummary } from "./types";


type Stock = {
  id: string;
  name: string;
  rate: number;
  quantity: number;
  amount: number;
};


type Props = {
  organisationId: string;
  currency?: string;
  inventory: InventorySummary;
};


function formatMoney(
  value: number,
  currency?: string
) {
  return `${currency ?? ""} ${value.toLocaleString()}`;
}



export default function InventoryOverviewCard({
  organisationId,
  currency,
  inventory,
}: Props) {


  const gainLoss =
    inventory.closing_stock - inventory.opening_stock;


  const summary = [

    {
      label: "Opening Stock",
      value: inventory.opening_stock,
      color: "text-gray-700",
    },

    {
      label: "Closing Stock",
      value: inventory.closing_stock,
      color: "text-blue-600",
    },

    {
      label: "Inventory Value",
      value: inventory.inventory,
      color: "text-primary",
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
          gap-3
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
            Inventory Overview
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Stock position and movement
          </p>

        </div>



        <Link
          href={`/dashboard/${organisationId}/stocks`}
          className="
            text-sm
            font-medium
            text-primary
            hover:underline
          "
        >
          Stocks
        </Link>


      </div>





      {/* SUMMARY */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-3
        "
      >

        {summary.map((item) => (

          <div
            key={item.label}
            className="
              rounded-xl
              bg-gray-50
              border
              border-gray-100
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


          </div>

        ))}

      </div>






      {/* GAIN LOSS */}

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-gray-100
          bg-gradient-to-r
          from-gray-50
          to-white
          p-4
        "
      >

        <div>

          <p
            className="
              text-xs
              uppercase
              tracking-wide
              text-gray-400
            "
          >
            Stock Movement
          </p>


          <p
            className="
              mt-1
              text-sm
              text-gray-600
            "
          >
            Closing stock compared to opening stock
          </p>

        </div>



        <p
          className={`
            font-bold
            text-lg
            ${
              gainLoss >= 0
              ? "text-green-600"
              : "text-red-600"
            }
          `}
        >
          {gainLoss >= 0 ? "+" : ""}
          {formatMoney(
            gainLoss,
            currency
          )}

        </p>


      </div>







      {/* STOCK LIST */}

      <div
        className="
          mt-5
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-3
          "
        >

          <h3
            className="
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Stock Summary
          </h3>


          <span
            className="
              text-xs
              text-gray-400
            "
          >
            {inventory.stocks.length} items
          </span>


        </div>



        <div
          className="
            space-y-2
          "
        >

          {inventory.stocks.map((stock) => (

            <div
              key={stock.id}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-gray-100
                p-3
                hover:bg-gray-50
                transition
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-gray-800
                  "
                >
                  {stock.name}
                </p>


                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  Qty: {stock.quantity}
                </p>


              </div>



              <p
                className="
                  text-sm
                  font-semibold
                  text-primary
                "
              >
                {formatMoney(
                  stock.amount,
                  currency
                )}
              </p>


            </div>

          ))}


        </div>


      </div>


    </div>

  );
}
