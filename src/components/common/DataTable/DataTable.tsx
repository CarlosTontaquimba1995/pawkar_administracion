import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  TableCellProps,
} from "@mui/material";
import { useThemeConfig } from "@/contexts/ThemeContext";

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: TableCellProps["align"];
  format?: (value: any, row?: any) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  hover?: boolean;
  stickyHeader?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  page,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  emptyMessage = "No hay datos disponibles",
  hover = true,
  stickyHeader = true,
}) => {
  const theme = useTheme();
  const { colors } = useThemeConfig();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  const getVisibleColumns = () => {
    if (!isMobile) return columns;
    return columns.filter((col) => !col.hideOnMobile);
  };

  const visibleColumns = getVisibleColumns();

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        boxShadow: `0 2px 8px ${colors.primary}10`,
        border: `1px solid ${colors.primary}20`,
        "&:hover": {
          boxShadow: `0 4px 16px ${colors.primary}20`,
        },
      }}
    >
      <TableContainer
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.primary,
            borderRadius: "4px",
          },
        }}
      >
        <Table stickyHeader={stickyHeader} size="small">
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    backgroundColor: colors.primary,
                    color: "#fff",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  hover={hover}
                  tabIndex={-1}
                  key={`row-${row.id || rowIndex}`}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:nth-of-type(odd)": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    "&:hover": {
                      backgroundColor: `${colors.primary}08`,
                    },
                  }}
                >
                  {visibleColumns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={`${column.id}-${rowIndex}`}
                        align={column.align}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: column.minWidth || "200px",
                        }}
                      >
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              marginBottom: 0,
            },
          "& .MuiTablePagination-toolbar": {
            padding: 1,
            flexWrap: "wrap",
            justifyContent: "center",
            "& > *": {
              margin: "4px",
            },
          },
        }}
      />
    </Paper>
  );
};

export default DataTable;
