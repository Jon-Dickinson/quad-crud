import { NextResponse } from 'next/server';

type DataItem = {
  id: number;
  name: string;
  value: number;
  x: number;
  y: number;
};

const data: DataItem[] = [
  { id: 1, name: 'Item 1', value: 10, x: 50, y: 20 },
  { id: 2, name: 'Item 2', value: 20, x: -30, y: 40 },
  { id: 3, name: 'Item 3', value: 30, x: -10, y: -30 },
  { id: 4, name: 'Item 4', value: 40, x: 30, y: -50 },
];

export async function GET() {
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, value, x, y } = body;
  const newItem: DataItem = {
    id: data.length + 1,
    name,
    value,
    x,
    y,
  };
  data.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, name, value, x, y } = body;

  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data[index] = { id, name, value, x, y };
    return NextResponse.json(data[index]);
  } else {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const index = data.findIndex((item) => item.id === id);

  if (index !== -1) {
    const deletedItem = data.splice(index, 1);
    return NextResponse.json(deletedItem[0]);
  } else {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
}
