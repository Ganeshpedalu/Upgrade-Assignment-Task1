import React, { useMemo, useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from '@mui/material';
import { useTable, usePagination } from 'react-table';
import { CSVLink } from 'react-csv';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import mockData from '../mockData.json';
import '../App.css';

export default function AdminDashboard() {
  // Mock data and columns definitions
  const data = useMemo(() => mockData, []);
  const columns = useMemo(() => [
    {
      Header: 'Serial Number',
      accessor: (row, index) => index + 1,
      width: 100,
    },
    {
      Header: 'Name',
      accessor: 'first_name',
    },
    {
      Header: 'Phone Number',
      accessor: 'phone_number',
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
    {
      Header: 'Level',
      accessor: 'level',
    },
    {
      Header: 'Profession',
      accessor: 'profession',
    },
  ], []);

  // React-table hooks for pagination and data handling
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }, // Show fewer rows on smaller screens
    },
    usePagination
  );

  // State for search and filter
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Event handler for filter change
  const handleFilterChange = (e) => {
    setFilterLevel(e.target.value);
    gotoPage(0);
  };

  // Filtered data based on search and filter criteria
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return (
        row.first_name.toLowerCase().includes(searchText.toLowerCase()) &&
        (filterLevel === '' || row.level === filterLevel)
      );
    });
  }, [data, searchText, filterLevel]);

  // React-table hooks for filtered pagination
  const {
    getTableProps: getFilteredTableProps,
    getTableBodyProps: getFilteredTableBodyProps,
    headerGroups: filteredHeaderGroups,
    page: filteredPage,
    prepareRow: prepareFilteredRow,
    pageCount: filteredPageCount,
    gotoPage: gotoFilteredPage,
    setPageSize: setFilteredPageSize,
    state: { pageIndex: filteredPageIndex, pageSize: filteredPageSize },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 25 },
    },
    usePagination
  );

  // Prepare CSV data for download
  const csvData = filteredData.map((row) => ({
    'Serial Number': row.first_name,
    'Name': row.first_name,
    'Phone Number': row.phone_number,
    'Email': row.email,
    'Level': row.level,
    'Profession': row.profession,
  }));

  // Pagination Component
  const handleChangePage = (event, newPage) => {
    gotoFilteredPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setFilteredPageSize(parseInt(event.target.value, 10));
    gotoFilteredPage(0);
  };

  // Create a custom theme with the desired table header background color
  const theme = createTheme({
    overrides: {
      MuiTableCell: {
        head: {
          backgroundColor: '#757474', // Change this to your desired color
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className='container relative'>
        {/* Search input */}
        <div className='search-container absolute top-0 left-0 mt-2 ml-2'>
          <TextField
            label='Search by name...'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            variant='outlined'
            size='small'
          />
        </div>
        {/* Filter dropdown */}
        <div className='filter-container absolute top-0 right-0 mt-2 mr-2'>
          <FormControl variant='outlined' size='small'>
            <InputLabel>Filter by Level</InputLabel>
            <Select
              value={filterLevel}
              onChange={handleFilterChange}
              label='Filter by Level'
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='internship'>Internship</MenuItem>
              <MenuItem value='entry-level'>Entry-level</MenuItem>
              <MenuItem value='mid-level'>Mid-level</MenuItem>
              <MenuItem value='senior-level'>Senior-level</MenuItem>
            </Select>
          </FormControl>
        </div>
        {/* Table */}
        <div className='table-container'>
          <TableContainer component={Paper}>
            <Table stickyHeader {...getFilteredTableProps()}>
              <TableHead>
                {filteredHeaderGroups.map((headerGroup) => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <TableCell {...column.getHeaderProps()}>
                        {column.render('Header')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody {...getFilteredTableBodyProps()}>
                {filteredPage.map((row) => {
                  prepareFilteredRow(row);
                  return (
                    <TableRow {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <TableCell {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {/* Pagination */}
        <div className='pagination'>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            count={filteredData.length}
            rowsPerPage={filteredPageSize}
            page={filteredPageIndex}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
        {/* Download CSV button */}
        <div className='download-container absolute bottom-0 left-0 mb-2 ml-2'>
          <CSVLink data={csvData} filename={'data.csv'}>
            <Button variant='contained' color='primary'>
              Download
            </Button>
          </CSVLink>
        </div>
      </div>
    </ThemeProvider>
  );
}
