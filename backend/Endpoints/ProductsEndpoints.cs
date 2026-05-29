using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class ProductsEndpoints
{
    public static void MapProductsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/product");

        group.MapGet("/", async (AppDbContext db) =>
        {
            var productsWithStock = await db.Products
                .Select(p => new
                {
                    p.Id,
                    p.ProductName,
                    p.Price,
                    StockQuantity = db.StockProducts.Where(sp => sp.ProductId == p.Id).Select(sp => sp.StockQuantity).FirstOrDefault(),
                    StockProductId = db.StockProducts.Where(sp => sp.ProductId == p.Id).Select(sp => sp.Id).FirstOrDefault()
                })
                .ToListAsync();
            return Results.Ok(productsWithStock);
        });
    }
}