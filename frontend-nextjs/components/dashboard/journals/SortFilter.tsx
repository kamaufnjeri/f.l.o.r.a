"use client";

import SelectFilter, { Option } from "./SelectFilter";

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
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