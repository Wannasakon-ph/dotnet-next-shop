using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class StockProductEndpoints
{
    public static void MapStockProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/stock");

        group.MapGet("/", async (AppDbContext db) =>
        {
            IQueryable<StockProduct> query = db.StockProducts;
            var stockProducts = await query.ToListAsync();
            return Results.Ok(stockProducts);
        });

        group.MapPost("/create", async (AppDbContext db, CreateStockProduct request) =>
        {
            var stockProduct = new StockProduct
            {
                ProductId = request.ProductId,
                StockQuantity = request.StockQuantity
            };
            db.StockProducts.Add(stockProduct);
            await db.SaveChangesAsync();
            return Results.Created($"/api/stock/{stockProduct.Id}", stockProduct);
        });

        group.MapPut("/update", async (AppDbContext db, UpdateStockProduct request) =>
        {
            var stockProduct = await db.StockProducts.FindAsync(request.Id);
            if (stockProduct == null)
            {
                return Results.NotFound();
            }
            stockProduct.ProductId = request.ProductId;
            stockProduct.StockQuantity = request.StockQuantity;
            await db.SaveChangesAsync();
            return Results.Ok(stockProduct);
        });
        
        group.MapDelete("/delete/{id}", async (AppDbContext db, int id) =>
        {
            var stockProduct = await db.StockProducts.FindAsync(id);
            if (stockProduct == null)
            {
                return Results.NotFound();
            }
            db.StockProducts.Remove(stockProduct);
            await db.SaveChangesAsync();
            return Results.Ok(stockProduct);
        });
    }
}
