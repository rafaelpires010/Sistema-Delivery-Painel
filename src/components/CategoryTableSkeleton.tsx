import { Skeleton, TableCell, TableRow } from "@mui/material";

export const CategoryTableSkeleton = () => (
    <TableRow>
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
            <Skeleton variant="text" />
        </TableCell>

        <TableCell>
            <Skeleton variant="text" />
        </TableCell>
        <TableCell >
            <Skeleton variant="text" />
        </TableCell>
    </TableRow>
);