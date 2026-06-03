"use client";

import React from "react";
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
}: Props) {
  return (
    <SelectFilter
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Sort by"
      name="sort_by"
    />
  );
}