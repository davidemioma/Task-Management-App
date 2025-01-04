"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { format } from "date-fns";
import { Calendar } from "./calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  isPending?: boolean;
  placeholder?: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  isSearch?: boolean;
};

const DatePicker = ({
  isPending,
  isSearch,
  placeholder,
  value,
  onChange,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={isPending}>
        <Button
          variant={"outline"}
          disabled={isPending}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? (
            format(value, "PPP")
          ) : (
            <span>{placeholder || "Pick a date"}</span>
          )}

          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        {isSearch ? (
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => onChange(date as Date)}
            initialFocus
          />
        ) : (
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => onChange(date as Date)}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
