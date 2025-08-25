"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white dark:bg-gray-900 group/calendar p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 [--cell-size:40px]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size) font-semibold text-gray-900 dark:text-white",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-blue-500 border border-gray-300 dark:border-gray-600 shadow-xs has-focus:ring-blue-500/20 has-focus:ring-2 rounded-lg bg-transparent dark:bg-gray-800 transition-all",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-white dark:bg-gray-800 inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-gray-900 dark:text-white",
          captionLayout === "label"
            ? "text-base"
            : "rounded-lg pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-gray-500 [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-gray-500 dark:text-gray-400 rounded-md flex-1 font-medium text-sm select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-sm select-none text-gray-400 dark:text-gray-500",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-gradient-to-r from-blue-500 to-blue-400 text-white",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-gradient-to-l from-blue-500 to-blue-400 text-white", defaultClassNames.range_end),
        today: cn(
          "border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-md data-[selected=true]:border-transparent data-[selected=true]:text-white",
          defaultClassNames.today
        ),
        outside: cn(
          "text-gray-300 dark:text-gray-600 aria-selected:text-gray-300 dark:aria-selected:text-gray-600",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-gray-300 dark:text-gray-700 opacity-70",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4 text-gray-600 dark:text-gray-300", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-gray-600 dark:text-gray-300", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 text-gray-600 dark:text-gray-300", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center text-gray-400 dark:text-gray-500">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-gradient-to-br data-[selected-single=true]:from-blue-500 data-[selected-single=true]:to-blue-600 data-[selected-single=true]:text-white data-[range-middle=true]:bg-blue-100 data-[range-middle=true]:dark:bg-blue-900/40 data-[range-middle=true]:text-blue-900 data-[range-middle=true]:dark:text-blue-100 data-[range-start=true]:bg-gradient-to-r data-[range-start=true]:from-blue-500 data-[range-start=true]:to-blue-400 data-[range-start=true]:text-white data-[range-end=true]:bg-gradient-to-l data-[range-end=true]:from-blue-500 data-[range-end=true]:to-blue-400 data-[range-end=true]:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150",
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-medium",
        "group-data-[focused=true]/day:border-blue-500 group-data-[focused=true]/day:ring-blue-500/20 group-data-[focused=true]/day:ring-2",
        "data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md",
        "data-[range-middle=true]:rounded-none",
        "data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }