import Link from "next/link";
import { ReactNode } from "react";


type Props = {
  title: string;
  description?: string;
  href?: string;
  children: ReactNode;
};


export default function DashboardCard({
  title,
  description,
  href,
  children,
}: Props) {


  return (
    <div
      className="
        w-full
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
        overflow-hidden
        transition
        hover:shadow-md
      "
    >


      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          px-5
          py-4
          border-b
          border-gray-100
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
            {title}
          </h2>


          {description && (
            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              {description}
            </p>
          )}

        </div>



        {href && (
          <Link
            href={href}
            className="
              text-sm
              font-medium
              text-primary
              hover:underline
            "
          >
            View
          </Link>
        )}

      </div>




      {/* BODY */}

      <div
        className="
          p-5
        "
      >
        {children}
      </div>


    </div>
  );
}
