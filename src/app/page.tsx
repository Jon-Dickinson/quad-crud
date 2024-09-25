'use client';

import { useEffect, useState } from 'react';
import { ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Scatter, ResponsiveContainer, Cell } from 'recharts';
import { TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowModel } from '@mui/x-data-grid';

type DataItem = {
  id: number;
  name: string;
  value: number;
  x: number;
  y: number;
  color?: string; // Color for each point based on the quadrant
};

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState<number | string>(0);
  const [x, setX] = useState<number | string>(0);
  const [y, setY] = useState<number | string>(0);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/data');
      const jsonData: DataItem[] = await res.json();
      const updatedData = jsonData.map((item) => ({
        ...item,
        color: getColorForQuadrant(item.x, item.y),
      }));
      setData(updatedData);
    };
    fetchData();
  }, []);

  // Add new item
  const addItem = async () => {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value: Number(value),
        x: Number(x),
        y: Number(y),
      }),
    });
    const newItem: DataItem = await res.json();
    newItem.color = getColorForQuadrant(newItem.x, newItem.y);
    setData((prevData) => [...prevData, newItem]);
    setName('');
    setValue(0);
    setX(0);
    setY(0);
  };

  // Update item
  const updateItem = async (updatedRow: DataItem) => {
    const res = await fetch('/api/data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRow),
    });
    const updatedItem: DataItem = await res.json();
    updatedItem.color = getColorForQuadrant(updatedItem.x, updatedItem.y);
    setData((prevData) =>
      prevData.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Delete item
  const deleteItem = async (id: number) => {
    await fetch('/api/data', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  // Determine the color of the point based on the quadrant
  const getColorForQuadrant = (x: number, y: number) => {
    if (x > 0 && y > 0) {
      return '#fb5607'; // Quadrant 1
    } else if (x < 0 && y > 0) {
      return '#ff006e'; // Quadrant 2
    } else if (x < 0 && y < 0) {
      return '#8338ec'; // Quadrant 3
    } else if (x > 0 && y < 0) {
      return '#3a86ff'; // Quadrant 4
    }
    return '#000'; // Default color (if no match)
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90, editable: false },
    { field: 'name', headerName: 'Name', width: 150, editable: true },
    { field: 'value', headerName: 'Value', width: 110, type: 'number', editable: true },
    { field: 'x', headerName: 'X Coordinate', width: 150, type: 'number', editable: true },
    { field: 'y', headerName: 'Y Coordinate', width: 150, type: 'number', editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<Button variant="contained" color="secondary">Delete</Button>}
          label="Delete"
          onClick={() => {
            const id = params.id;
            if (typeof id === 'number') {
              deleteItem(id);
            } else {
              console.error('Invalid ID type. Expected number, but got:', typeof id);
            }
          }}
          key={params.id.toString()}
        />
      ),
    },
  ];

  // Handle row updates from the grid
  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow } as DataItem;
    updatedRow.color = getColorForQuadrant(updatedRow.x, updatedRow.y);
    updateItem(updatedRow);
    return updatedRow;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Scatter Plot with Editable DataGrid</h1>

      {/* Scatter Plot */}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          width={500}
          height={400}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="X Value" />
          <YAxis type="number" dataKey="y" name="Y Value" />
          <ZAxis dataKey="value" range={[50, 400]} name="Size" unit="" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Data Points" data={data} fillOpacity={1}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#000'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Form to Add New Points */}
      <div style={{ marginTop: 20 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="Value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
          variant="outlined"
          style={{ marginLeft: 20 }}
        />
        <TextField
          label="X Coordinate"
          type="number"
          value={x}
          onChange={(e) => setX(e.target.value === '' ? '' : Number(e.target.value))}
          variant="outlined"
          style={{ marginLeft: 20 }}
        />
        <TextField
          label="Y Coordinate"
          type="number"
          value={y}
          onChange={(e) => setY(e.target.value === '' ? '' : Number(e.target.value))}
          variant="outlined"
          style={{ marginLeft: 20 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={addItem}
          style={{ marginLeft: 20 }}
        >
          Add Item
        </Button>
      </div>

      {/* DataGrid for CRUD operations */}
      <h2 style={{ marginTop: 40 }}>Edit Data Points</h2>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          processRowUpdate={processRowUpdate}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}
