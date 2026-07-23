'use client'

import Link from "next/link";

import { useModalStore } from "@/stores/modalStore";
import { ModalName } from "@/types";
import { QuickStats } from "./types";


type Props = {
  organisationId: string;
  stats: QuickStats;
};


type Stat = {
  title: string;
  value: number;
  href: string;
  modal?: ModalName;
};



export default function QuickStatsCard({
  organisationId,
  stats,
}: Props) {


  const openModal = useModalStore(
    (state) => state.openModal
  );



  const statsData: Stat[] = [

    {
      title: "Customers",
      value: stats.customers,
      href: `/dashboard/${organisationId}/customers`,
      modal: "customer",
    },

    {
      title: "Suppliers",
      value: stats.suppliers,
      href: `/dashboard/${organisationId}/suppliers`,
      modal: "supplier",
    },

    {
      title: "Accounts",
      value: stats.accounts,
      href: `/dashboard/${organisationId}/accounts`,
      modal: "account",
    },

    {
      title: "Products",
      value: stats.products,
      href: `/dashboard/${organisationId}/stocks`,
      modal: "stock",
    },

    {
      title: "Services",
      value: stats.services,
      href: `/dashboard/${organisationId}/services`,
      modal: "service",
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
            Quick Statistics
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Business records overview
          </p>

        </div>


      </div>





      {/* STATS GRID */}

      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-5
          gap-3
        "
      >

        {statsData.map((stat) => (

          <div
            key={stat.title}
            className="
              rounded-xl
              border
              border-gray-100
              bg-gray-50/50
              p-4
              group
              transition
              hover:shadow-sm
            "
          >

            <Link
              href={stat.href}
              className="
                block
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
                {stat.title}
              </p>


              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-primary
                "
              >
                {stat.value}
              </p>


              <span
                className="
                  mt-2
                  block
                  text-xs
                  text-gray-500
                  group-hover:text-primary
                "
              >
                View →
              </span>


            </Link>



            {stat.modal && (

              <button
                type="button"
                onClick={() =>
                  openModal(stat.modal as ModalName)
                }
                className="
                  mt-3
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  py-1.5
                  text-xs
                  font-medium
                  text-gray-600
                  hover:text-primary
                  hover:border-primary
                  transition
                  cursor-pointer
                "
              >
                Add {stat.title.slice(0, -1)}
              </button>

            )}


          </div>

        ))}


      </div>


    </div>

  );

}
