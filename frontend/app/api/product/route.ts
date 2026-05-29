import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5152';
    
    const res = await fetch(`${apiUrl}/api/product`, {
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from .NET API');
    }

    const data = await res.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}