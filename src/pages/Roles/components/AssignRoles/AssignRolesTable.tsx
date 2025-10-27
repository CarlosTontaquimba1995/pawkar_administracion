import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Role } from "@/types/role.types";

interface AssignRolesTableProps {
  userRoles: Role[];
  allRoles: Role[];
  loading?: boolean;
  onRefresh: () => Promise<void>;
}

const AssignRolesTable: React.FC<AssignRolesTableProps> = ({
  allRoles = [],
  loading = false,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    if (!Array.isArray(allRoles)) return [];
    if (!searchTerm.trim()) return allRoles;

    const searchLower = searchTerm.toLowerCase().trim();
    return allRoles.filter(
      (role) =>
        (role?.name?.toLowerCase() || "").includes(searchLower) ||
        (role?.detail?.toLowerCase() || "").includes(searchLower)
    );
  }, [allRoles, searchTerm]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRoles.length) : 0;

  const isSystemRole = (roleName: string): boolean => {
    return roleName === "ROLE_USER" || roleName === "ROLE_ADMIN";
  };

  return (
    <Box>
      <Box mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={4}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      No se encontraron roles
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredRoles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.detail || "Sin descripción"}</TableCell>
                      <TableCell>
                        <Chip
                          label={role.estado ? "Activo" : "Inactivo"}
                          color={role.estado ? "success" : "default"}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            minWidth: 80,
                            justifyContent: "center",
                            "&.MuiChip-colorSuccess": {
                              bgcolor: "success.light",
                              color: "success.contrastText",
                              "&:hover": {
                                bgcolor: "success.main",
                              },
                            },
                            "&.MuiChip-colorDefault": {
                              bgcolor: "grey.200",
                              color: "text.secondary",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={isSystemRole(role.name)}
                          title={
                            isSystemRole(role.name)
                              ? "No se puede editar este rol del sistema"
                              : "Editar"
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isSystemRole(role.name)}
                          title={
                            isSystemRole(role.name)
                              ? "No se puede eliminar este rol del sistema"
                              : "Eliminar"
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={4} />
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRoles.length}
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
          }}
        />
      </Box>
    </Box>
  );
};

export default AssignRolesTable;
