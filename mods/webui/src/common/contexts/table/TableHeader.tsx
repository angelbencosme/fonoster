"use client";

import React from "react";
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTableContext } from "./useTableContext";
import { Pagination } from "@stories/pagination/Pagination";

interface FilterProps {
  defaultFilter?: string;
}

interface SearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

interface TableHeaderProps {
  children?: React.ReactNode;
}

interface TableHeaderComponent extends React.FC<TableHeaderProps> {
  Filter: React.FC<FilterProps>;
  Search: React.FC<SearchProps>;
  Pagination: React.FC<PaginationProps>;
}

const TableHeaderComponent = <T extends object>({
  children
}: TableHeaderProps) => {
  // Separar los children en controles y paginación
  const childrenArray = React.Children.toArray(children);
  const paginationComponent = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      child.type === TableHeaderComponent.Pagination
  );
  const otherComponents = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      child.type !== TableHeaderComponent.Pagination
  );

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: "flex", gap: 2, alignItems: "center" }}
      >
        {otherComponents}
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-start", md: "flex-end" }
        }}
      >
        {paginationComponent}
      </Grid>
    </Grid>
  );
};

// Compound Components
TableHeaderComponent.Filter = ({
  defaultFilter = "All"
}: {
  defaultFilter?: string;
}) => {
  const { headers, setGlobalFilter, globalFilter } = useTableContext();
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={globalFilter || defaultFilter || ""}
        onChange={(e) => setGlobalFilter?.(e.target.value)}
        sx={{
          height: "36px",
          "& .MuiSelect-select": {
            paddingTop: "6px",
            paddingBottom: "6px"
          }
        }}
      >
        {headers.map((column, index) =>
          index === 0 ? (
            <MenuItem key={index} value={"All"}>
              All
            </MenuItem>
          ) : (
            <MenuItem key={index} value={column.id || `column-${index}`}>
              {column.header
                ? typeof column.header === "string"
                  ? column.header
                  : "Column"
                : `Column ${index}`}
            </MenuItem>
          )
        )}
      </Select>
    </FormControl>
  );
};

TableHeaderComponent.Search = ({
  value = "",
  onChange,
  placeholder = "Search..."
}: SearchProps) => (
  <TextField
    size="small"
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ color: "text.secondary" }} />
        </InputAdornment>
      ),
      sx: { height: "36px" }
    }}
  />
);

TableHeaderComponent.Pagination = () => {
  const {
    fonosterResponse,
    setNextPageCursor,
    setPrevPageCursor,
    nextPage,
    previousPage,
    pageSize,
    pageIndex
  } = useTableContext();

  console.log("Pagination component:", {
    pageIndex,
    nextToken: fonosterResponse?.nextPageToken,
    prevToken: fonosterResponse?.prevPageToken
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Pagination
        count={32}
        rowsPerPage={pageSize}
        onClick={(event, newPage, lastPage) => {
          console.log("Pagination clicked:", {
            newPage,
            lastPage,
            nextToken: fonosterResponse?.nextPageToken,
            prevToken: fonosterResponse?.prevPageToken
          });
          
          if (newPage > lastPage) {
            console.log("Going to next page with token:", fonosterResponse?.nextPageToken);
            setNextPageCursor?.(fonosterResponse?.nextPageToken);
            nextPage?.();
          }
          else {
            console.log("Going to previous page with token:", fonosterResponse?.prevPageToken);
            setPrevPageCursor?.(fonosterResponse?.prevPageToken);
            previousPage?.();
          }
        }}
      />
    </Box>
  );
};

export const TableHeader = TableHeaderComponent as TableHeaderComponent;
