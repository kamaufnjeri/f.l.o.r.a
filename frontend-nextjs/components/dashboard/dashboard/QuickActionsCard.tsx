import Link from "next/link";

import {
  FaCartPlus,
  FaFileInvoiceDollar,
  FaBook,
  FaMoneyBillTransfer,
} from "react-icons/fa6";


type Props = {
  organisationId: string;
};


type Action = {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};



export default function QuickActionsCard({
  organisationId,
}: Props) {


  const actions: Action[] = [

    {
      label: "Record Sale",
      description: "Create customer invoice",
      href: `/dashboard/${organisationId}/sales/record`,
      icon: <FaFileInvoiceDollar />,
    },


    {
      label: "Record Purchase",
      description: "Capture supplier purchase",
      href: `/dashboard/${organisationId}/purchases/record`,
      icon: <FaCartPlus />,
    },


    {
      label: "Service Income",
      description: "Record service revenue",
      href: `/dashboard/${organisationId}/service-income/record`,
      icon: <FaMoneyBillTransfer />,
    },


    {
      label: "Journal",
      description: "Post accounting entry",
      href: `/dashboard/${organisationId}/journals/record`,
      icon: <FaBook />,
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
          mb-5
        "
      >

        <h2
          className="
            text-base
            font-semibold
            text-primary
          "
        >
          Quick Actions
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Create new business transactions
        </p>


      </div>





      {/* ACTION GRID */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-3
        "
      >

        {actions.map((action) => (

          <Link
            href={action.href}
            key={action.label}
            className="
              group
              rounded-2xl
              border
              border-gray-100
              bg-gray-50/50
              p-4
              transition
              hover:border-primary/30
              hover:bg-primary/5
              hover:shadow-sm
            "
          >


            <div
              className="
                flex
                items-center
                justify-center
                h-10
                w-10
                rounded-xl
                bg-primary/10
                text-primary
                text-lg
                group-hover:bg-primary
                group-hover:text-white
                transition
              "
            >

              {action.icon}

            </div>




            <h3
              className="
                mt-4
                text-sm
                font-semibold
                text-gray-800
                group-hover:text-primary
              "
            >
              {action.label}
            </h3>



            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              {action.description}
            </p>



          </Link>

        ))}


      </div>


    </div>

  );

}
