'use server'

import { SelectOptions } from "@/types";
import { cookies } from "next/headers";

const backendURL = process.env.BACKEND_URL;

export type SelectOptionsResponse = {
  success: boolean;
  selectOptions: SelectOptions | null;
};

export async function fetchSelectOptions(
  orgId: string
): Promise<SelectOptionsResponse> {
  try {
    const cookieStore = await cookies();

    const res = await fetch(
      `${backendURL}/${orgId}/select_options/`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        success: false,
        selectOptions: null,
      };
    }

    const data: SelectOptions = await res.json();

    return {
      success: true,
      selectOptions: data,
    };
  } catch (error) {
    console.log("Error", error);

    return {
      success: false,
      selectOptions: null,
    };
  }
}