"use client";

import { OptionType } from "@/constants";
import SelectFilter from "./SelectFilter";

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: OptionType[];
  name: string;
};

export default function SortFilter({
  value,
  onChange,
  options,
  name,
}: Props) {
  return (
    <SelectFilter
      value={value}
      onChange={onChange}
      options={options}
      name={name}
      placeholder="Sort by"
    />
  );
}