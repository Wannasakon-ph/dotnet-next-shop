using Microsoft.EntityFrameworkCore;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; }
    public DbSet<StockProduct> StockProducts { get; set; }
    public DbSet<Cart> Carts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Cart -> StockProduct
        modelBuilder.Entity<Cart>()
            .HasOne(c => c.StockProduct)
            .WithMany()
            .HasForeignKey(c => c.IdStockProduct)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed Data สำหรับตาราง Products
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, ProductName = "เสื้อยืดคอกลม สีขาว ไซส์ M", Price = 250 },
            new Product { Id = 2, ProductName = "กางเกงยีนส์ ทรงกระบอก", Price = 890 },
            new Product { Id = 3, ProductName = "รองเท้าผ้าใบ สไตล์มินิมอล", Price = 1500 },
            new Product { Id = 4, ProductName = "กระเป๋าเป้สะพายหลัง (กันน้ำ)", Price = 990 },
            new Product { Id = 5, ProductName = "หมวกแก๊ป สีดำ", Price = 199 }
        );

        // Seed Data สำหรับตาราง StockProducts
        modelBuilder.Entity<StockProduct>().HasData(
            new StockProduct { Id = 1, ProductId = 1, StockQuantity = 10 },
            new StockProduct { Id = 2, ProductId = 2, StockQuantity = 5 },
            new StockProduct { Id = 3, ProductId = 3, StockQuantity = 0 },
            new StockProduct { Id = 4, ProductId = 4, StockQuantity = 20 },
            new StockProduct { Id = 5, ProductId = 5, StockQuantity = 8 }
        );
    }
}