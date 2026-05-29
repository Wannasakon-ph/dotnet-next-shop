using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class ShoppingCartsEndpoints
{
    public static void MapShoppingCartsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cart");

        group.MapGet("/", async (AppDbContext db) =>
        {
            var carts = await db.Carts
                .Include(c => c.StockProduct)
                .ThenInclude(sp => sp.Product)
                .ToListAsync();
            return Results.Ok(carts);
        });

        group.MapPost("/add", async (AppDbContext db, AddToCartRequest request) =>
        {
            if (request.TotalQuantity <= 0)
            {
                return Results.BadRequest("จำนวนสินค้าต้องมากกว่า 0");
            }

            var stockProduct = await db.StockProducts
                .Include(sp => sp.Product)
                .FirstOrDefaultAsync(sp => sp.Id == request.IdStockProduct);

            if (stockProduct == null)
            {
                return Results.NotFound("ไม่พบสต็อกของสินค้าชิ้นนี้");
            }

            var existingCartItem = await db.Carts
                .FirstOrDefaultAsync(c => c.IdStockProduct == request.IdStockProduct);

            int currentInCart = existingCartItem?.TotalQuantity ?? 0;
            int newQuantity = currentInCart + request.TotalQuantity;

            if (newQuantity > stockProduct.StockQuantity)
            {
                return Results.BadRequest(new 
                { 
                    Message = $"จำนวนสินค้าในตะกร้ารวมกัน ({newQuantity} ชิ้น) เกินสต็อกที่มีอยู่ (สต็อกคงเหลือ: {stockProduct.StockQuantity} ชิ้น)" 
                });
            }

            if (existingCartItem != null)
            {
                existingCartItem.TotalQuantity = newQuantity;
                existingCartItem.TotalPrice = newQuantity * stockProduct.Product.Price;
            }
            else
            {
                var newCartItem = new Cart
                {
                    IdStockProduct = request.IdStockProduct,
                    TotalQuantity = request.TotalQuantity,
                    TotalPrice = request.TotalQuantity * stockProduct.Product.Price
                };
                db.Carts.Add(newCartItem);
            }

            await db.SaveChangesAsync();

            var updatedCarts = await db.Carts
                .Include(c => c.StockProduct)
                .ThenInclude(sp => sp.Product)
                .ToListAsync();

            return Results.Ok(updatedCarts);
        });

        group.MapPut("/update", async (AppDbContext db, UpdateCartRequest request) =>
        {
            if (request.TotalQuantity <= 0)
            {
                return Results.BadRequest("จำนวนสินค้าต้องมากกว่า 0");
            }

            var cartItem = await db.Carts
                .Include(c => c.StockProduct)
                .ThenInclude(sp => sp.Product)
                .FirstOrDefaultAsync(c => c.Id == request.Id);

            if (cartItem == null)
            {
                return Results.NotFound("ไม่พบสินค้าชิ้นนี้ในตะกร้า");
            }

            if (request.TotalQuantity > cartItem.StockProduct.StockQuantity)
            {
                return Results.BadRequest(new 
                { 
                    Message = $"ไม่สามารถอัปเดตเป็น {request.TotalQuantity} ชิ้นได้ เนื่องจากสินค้าเหลือสต็อกเพียง {cartItem.StockProduct.StockQuantity} ชิ้น" 
                });
            }

            cartItem.TotalQuantity = request.TotalQuantity;
            cartItem.TotalPrice = request.TotalQuantity * cartItem.StockProduct.Product.Price;

            await db.SaveChangesAsync();
            return Results.Ok(cartItem);
        });

        group.MapDelete("/remove/{id}", async (AppDbContext db, int id) =>
        {
            var cartItem = await db.Carts.FindAsync(id);
            if (cartItem == null)
            {
                return Results.NotFound("ไม่พบสินค้าชิ้นนี้ในตะกร้า");
            }

            db.Carts.Remove(cartItem);
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว" });
        });

        group.MapDelete("/clear", async (AppDbContext db) =>
        {
            var allItems = await db.Carts.ToListAsync();
            if (allItems.Any())
            {
                db.Carts.RemoveRange(allItems);
                await db.SaveChangesAsync();
            }
            return Results.Ok(new { message = "ล้างตะกร้าสินค้าเรียบร้อยแล้ว" });
        });

        group.MapPost("/checkout", async (AppDbContext db) =>
        {
            using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                // โหลดตะกร้า
                var cartItems = await db.Carts
                    .Include(c => c.StockProduct)
                    .ThenInclude(sp => sp.Product)
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return Results.BadRequest("ไม่พบสินค้าในตะกร้าของคุณ");
                }

                foreach (var item in cartItems)
                {
                    var stock = await db.StockProducts.FindAsync(item.IdStockProduct);
                    if (stock == null)
                    {
                        return Results.BadRequest($"ไม่พบข้อมูลสต็อกสำหรับสินค้ารหัส: {item.IdStockProduct}");
                    }

                    if (stock.StockQuantity < item.TotalQuantity)
                    {
                        return Results.BadRequest(new 
                        { 
                            Message = $"สต็อกของสินค้า '{item.StockProduct.Product.ProductName}' ไม่เพียงพอ (ในสต็อกเหลือ {stock.StockQuantity} ชิ้น แต่ในตะกร้าต้องการ {item.TotalQuantity} ชิ้น) กรุณาปรับลดจำนวนสินค้าลง" 
                        });
                    }

                    stock.StockQuantity -= item.TotalQuantity;
                }

                db.Carts.RemoveRange(cartItems);

                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Results.Ok(new { Message = "การสั่งซื้อและหักสต็อกสินค้าสำเร็จเรียบร้อยแล้ว!" });
            }
            catch (System.Exception ex)
            {
                await transaction.RollbackAsync();
                return Results.Problem($"เกิดข้อผิดพลาดระหว่างทำรายการ: {ex.Message}");
            }
        });
    }
}

public record AddToCartRequest(int IdStockProduct, int TotalQuantity);
public record UpdateCartRequest(int Id, int TotalQuantity);