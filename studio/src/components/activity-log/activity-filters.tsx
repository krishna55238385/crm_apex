"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, FilterX, Users, Cuboid } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityFiltersProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  actor: string;
  setActor: (actor: string) => void;
  entity: string;
  setEntity: (entity: string) => void;
  clearFilters: () => void;
  users: any[];
}

export default function ActivityFilters({
  date,
  setDate,
  actor,
  setActor,
  entity,
  setEntity,
  clearFilters,
  users = [],
}: ActivityFiltersProps) {

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[260px] justify-start text-left font-normal bg-background",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Actor Filter */}
      <Select value={actor} onValueChange={setActor}>
        <SelectTrigger className="w-full sm:w-[200px] bg-background">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Actors" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actors</SelectItem>
          <SelectItem value="ai">AI System</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Entity Filter */}
      <Select value={entity} onValueChange={setEntity}>
        <SelectTrigger className="w-full sm:w-[200px] bg-background">
          <div className="flex items-center gap-2">
            <Cuboid className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Entity Types" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Entity Types</SelectItem>
          <SelectItem value="Lead">Lead</SelectItem>
          <SelectItem value="Deal">Deal</SelectItem>
          <SelectItem value="Task">Task</SelectItem>
          <SelectItem value="FollowUp">FollowUp</SelectItem>
          <SelectItem value="User">User</SelectItem>
          <SelectItem value="Attendance">Attendance</SelectItem>
          <SelectItem value="Setting">Setting</SelectItem>
          <SelectItem value="Role">Role</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-grow" />

      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
        <FilterX className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
