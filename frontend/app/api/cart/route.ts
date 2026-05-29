import { NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5152';

export async function GET() {
  try {
    const res = await fetch(`${apiUrl}/api/cart`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText || 'Failed to fetch cart' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'checkout') {
      const res = await fetch(`${apiUrl}/api/cart/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || 'การตัดสต็อกล้มเหลว';
        return NextResponse.json({ error: errorMessage }, { status: res.status });
      }

      const result = await res.json();
      return NextResponse.json(result);
    }

    const res = await fetch(`${apiUrl}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idStockProduct: body.idStockProduct,
        totalQuantity: body.totalQuantity
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.message || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้';
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error posting to cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const res = await fetch(`${apiUrl}/api/cart/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: body.id,
        totalQuantity: body.totalQuantity
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.message || 'ไม่สามารถอัปเดตตะกร้าได้';
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clear = searchParams.get('clear');

    if (clear === 'true') {
      const res = await fetch(`${apiUrl}/api/cart/clear`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json({ error: errorText || 'Failed to clear cart' }, { status: res.status });
      }

      const result = await res.json();
      return NextResponse.json(result);
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing cart item id' }, { status: 400 });
    }

    const res = await fetch(`${apiUrl}/api/cart/remove/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText || 'Failed to remove item' }, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
